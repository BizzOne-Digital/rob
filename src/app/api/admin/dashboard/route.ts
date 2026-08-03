import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { CustomRequest } from "@/models/CustomRequest";
import { Inquiry } from "@/models/Inquiry";
import { ActivityLog } from "@/models/ActivityLog";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [
    ordersCount,
    pendingOrders,
    inProduction,
    salesAgg,
    productsCount,
    lowStock,
    customRequestsNew,
    inquiriesNew,
    publishedProducts,
    draftProducts,
    recentActivity,
    ordersByCategory,
    salesTrendRaw,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({
      fulfillmentStatus: { $in: ["pending_payment", "paid", "confirmed"] },
    }),
    Order.countDocuments({ fulfillmentStatus: "in_production" }),
    Order.aggregate<{ total: number }>([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Product.countDocuments({ status: { $ne: "archived" } }),
    Product.countDocuments({
      trackInventory: true,
      inventory: { $lte: 5 },
      status: { $ne: "archived" },
    }),
    CustomRequest.countDocuments({ status: "new" }),
    Inquiry.countDocuments({ status: "new" }),
    Product.countDocuments({ status: "published" }),
    Product.countDocuments({ status: "draft" }),
    ActivityLog.find().sort({ createdAt: -1 }).limit(20).lean(),
    Order.aggregate<{ _id: string; count: number; revenue: number }>([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$product.categorySlug", "uncategorized"] },
          count: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { revenue: -1 } },
    ]),
    Order.aggregate<{ _id: string; total: number; count: number }>([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: fourteenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const salesByDayMap = new Map(
    salesTrendRaw.map((row) => [row._id, { total: row.total, count: row.count }]),
  );
  const salesTrend: Array<{ date: string; total: number; count: number }> = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(fourteenDaysAgo.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = salesByDayMap.get(key);
    salesTrend.push({
      date: key,
      total: row?.total ?? 0,
      count: row?.count ?? 0,
    });
  }

  return NextResponse.json({
    counts: {
      orders: ordersCount,
      pendingOrders,
      inProduction,
      salesTotal: salesAgg[0]?.total ?? 0,
      products: productsCount,
      lowStock,
      customRequestsNew,
      inquiriesNew,
      publishedProducts,
      draftProducts,
    },
    recentActivity,
    ordersByCategory,
    salesTrend,
  });
}
