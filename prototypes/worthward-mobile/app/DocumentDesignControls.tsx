"use client";

import type { DocumentDesign } from "./document-types";
import styles from "./document-studio.module.css";

export function DocumentDesignControls({
  value,
  onChange,
}: {
  value: DocumentDesign;
  onChange: (value: DocumentDesign) => void;
}) {
  return (
    <fieldset className={styles.section}>
      <legend>Design</legend>
      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label htmlFor="document-template">Template</label>
          <select
            id="document-template"
            value={value.templateKey}
            onChange={(event) =>
              onChange({
                ...value,
                templateKey: event.target.value as DocumentDesign["templateKey"],
              })
            }
          >
            <option value="executive">Executive</option>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="document-density">Spacing</label>
          <select
            id="document-density"
            value={value.density}
            onChange={(event) =>
              onChange({
                ...value,
                density: event.target.value as DocumentDesign["density"],
              })
            }
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="document-accent">Accent</label>
          <select
            id="document-accent"
            value={value.accent}
            onChange={(event) =>
              onChange({
                ...value,
                accent: event.target.value as DocumentDesign["accent"],
              })
            }
          >
            <option value="forest">Forest</option>
            <option value="navy">Navy</option>
            <option value="charcoal">Charcoal</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="document-scale">Text size</label>
          <select
            id="document-scale"
            value={value.fontScale}
            onChange={(event) =>
              onChange({
                ...value,
                fontScale: Number(event.target.value) as DocumentDesign["fontScale"],
              })
            }
          >
            <option value={95}>Small</option>
            <option value={100}>Standard</option>
            <option value={105}>Large</option>
          </select>
        </div>
      </div>
      <p>
        These controls preserve one semantic reading order. Parsing quality is
        verified in QA rather than promised by a label.
      </p>
    </fieldset>
  );
}
