"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import type { ContentBlockType, MediaRef } from "@/types";
import type { PageSection } from "@/lib/admin/types";
import { ImageField } from "./ImagePicker";
import { cn } from "@/lib/utils";

const SECTION_TYPES: ContentBlockType[] = [
  "hero",
  "text",
  "image",
  "image_grid",
  "cta",
  "faq",
  "process",
  "categories",
  "products",
  "gallery",
  "testimonials",
  "newsletter",
  "custom_form",
  "gift_inspiration",
  "marquee",
  "split",
  "rich",
];

function newSection(type: ContentBlockType = "text"): PageSection {
  return {
    key: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    eyebrow: "",
    heading: "",
    subheading: "",
    body: "",
    bullets: [],
    ctaLabel: "",
    ctaLink: "",
    secondaryCtaLabel: "",
    secondaryCtaLink: "",
    images: [],
    background: "",
    layout: "default",
    visible: true,
    displayOrder: 0,
  };
}

interface PageSectionEditorProps {
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
}

function SortableSection({
  section,
  index,
  onUpdate,
  onDuplicate,
  onDelete,
  onToggleVisible,
}: {
  section: PageSection;
  index: number;
  onUpdate: (next: PageSection) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const bulletsText = (section.bullets ?? []).join("\n");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "admin-card overflow-hidden",
        isDragging && "opacity-70 shadow-lg",
        section.visible === false && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2 border-b border-admin-border bg-slate-50 px-3 py-2">
        <button
          type="button"
          className="cursor-grab rounded p-1 text-slate-400 hover:bg-white active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Section {index + 1}
        </span>
        <select
          className="admin-input ml-2 max-w-[180px] py-1"
          value={section.type}
          onChange={(e) =>
            onUpdate({ ...section, type: e.target.value as ContentBlockType })
          }
        >
          {SECTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="admin-btn-ghost"
            title={section.visible === false ? "Show" : "Hide"}
            onClick={onToggleVisible}
          >
            {section.visible === false ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <button type="button" className="admin-btn-ghost" title="Duplicate" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="admin-btn-ghost text-rose-600"
            title="Delete"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div>
          <label className="admin-label">Eyebrow</label>
          <input
            className="admin-input"
            value={section.eyebrow ?? ""}
            onChange={(e) => onUpdate({ ...section, eyebrow: e.target.value })}
          />
        </div>
        <div>
          <label className="admin-label">Layout</label>
          <input
            className="admin-input"
            value={section.layout ?? "default"}
            onChange={(e) => onUpdate({ ...section, layout: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Heading</label>
          <input
            className="admin-input"
            value={section.heading ?? ""}
            onChange={(e) => onUpdate({ ...section, heading: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Subheading</label>
          <input
            className="admin-input"
            value={section.subheading ?? ""}
            onChange={(e) => onUpdate({ ...section, subheading: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Body</label>
          <textarea
            className="admin-input min-h-[100px]"
            value={section.body ?? ""}
            onChange={(e) => onUpdate({ ...section, body: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Bullets (one per line)</label>
          <textarea
            className="admin-input min-h-[80px]"
            value={bulletsText}
            onChange={(e) =>
              onUpdate({
                ...section,
                bullets: e.target.value
                  .split("\n")
                  .map((b) => b.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
        <div>
          <label className="admin-label">Primary CTA label</label>
          <input
            className="admin-input"
            value={section.ctaLabel ?? ""}
            onChange={(e) => onUpdate({ ...section, ctaLabel: e.target.value })}
          />
        </div>
        <div>
          <label className="admin-label">Primary CTA link</label>
          <input
            className="admin-input"
            value={section.ctaLink ?? ""}
            onChange={(e) => onUpdate({ ...section, ctaLink: e.target.value })}
          />
        </div>
        <div>
          <label className="admin-label">Secondary CTA label</label>
          <input
            className="admin-input"
            value={section.secondaryCtaLabel ?? ""}
            onChange={(e) =>
              onUpdate({ ...section, secondaryCtaLabel: e.target.value })
            }
          />
        </div>
        <div>
          <label className="admin-label">Secondary CTA link</label>
          <input
            className="admin-input"
            value={section.secondaryCtaLink ?? ""}
            onChange={(e) =>
              onUpdate({ ...section, secondaryCtaLink: e.target.value })
            }
          />
        </div>
        <div>
          <label className="admin-label">Background</label>
          <input
            className="admin-input"
            value={section.background ?? ""}
            onChange={(e) => onUpdate({ ...section, background: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Images</label>
          <div className="space-y-3">
            {(section.images ?? []).map((img, imgIndex) => (
              <div
                key={`${img.url}-${imgIndex}`}
                className="flex flex-wrap items-end gap-3 rounded-lg border border-admin-border p-3"
              >
                <ImageField
                  label={`Image ${imgIndex + 1}`}
                  value={img}
                  onChange={(next) => {
                    const images = [...(section.images ?? [])];
                    if (!next) {
                      images.splice(imgIndex, 1);
                    } else {
                      images[imgIndex] = next;
                    }
                    onUpdate({ ...section, images });
                  }}
                />
                <div className="min-w-[200px] flex-1">
                  <label className="admin-label">Alt text</label>
                  <input
                    className="admin-input"
                    value={img.alt ?? ""}
                    onChange={(e) => {
                      const images = [...(section.images ?? [])];
                      images[imgIndex] = { ...img, alt: e.target.value };
                      onUpdate({ ...section, images });
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => {
                const blank: MediaRef = { url: "", alt: "" };
                onUpdate({
                  ...section,
                  images: [...(section.images ?? []), blank],
                });
              }}
            >
              <Plus className="h-4 w-4" /> Add image slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSectionEditor({ sections, onChange }: PageSectionEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.key === active.id);
    const newIndex = sections.findIndex((s) => s.key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
      ...s,
      displayOrder: i,
    }));
    onChange(reordered);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Sections</h2>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={() =>
            onChange([
              ...sections,
              { ...newSection("text"), displayOrder: sections.length },
            ])
          }
        >
          <Plus className="h-4 w-4" /> Add section
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.map((section, index) => (
              <SortableSection
                key={section.key}
                section={section}
                index={index}
                onUpdate={(next) => {
                  const copy = [...sections];
                  copy[index] = next;
                  onChange(copy);
                }}
                onDuplicate={() => {
                  const dup: PageSection = {
                    ...structuredClone(section),
                    key: `${section.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    displayOrder: sections.length,
                  };
                  onChange([...sections, dup]);
                }}
                onDelete={() => {
                  onChange(
                    sections
                      .filter((_, i) => i !== index)
                      .map((s, i) => ({ ...s, displayOrder: i })),
                  );
                }}
                onToggleVisible={() => {
                  const copy = [...sections];
                  copy[index] = {
                    ...section,
                    visible: section.visible === false,
                  };
                  onChange(copy);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-admin-border bg-white px-4 py-10 text-center text-sm text-admin-muted">
          No sections yet. Add a section to start editing this page.
        </p>
      ) : null}
    </div>
  );
}

export { newSection };
