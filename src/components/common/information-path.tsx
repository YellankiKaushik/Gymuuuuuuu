import { Icon, type IconName } from "./icon";

/** Original application workflow diagram; stages describe records, not health advice. */
export function InformationPath({
  title,
  steps,
  caption,
}: {
  title: string;
  steps: readonly {
    label: string;
    detail: string;
    icon: IconName;
    href?: string;
  }[];
  caption: string;
}) {
  return (
    <figure className="information-path">
      <figcaption>
        <strong>{title}</strong>
        <span>{caption}</span>
      </figcaption>
      <ol>
        {steps.map((step, index) => (
          <li key={step.label}>
            <span className="path-symbol">
              <Icon name={step.icon} size={24} />
              <small>{String(index + 1).padStart(2, "0")}</small>
            </span>
            <div>
              {step.href ? (
                <a href={step.href}>
                  {step.label}
                  <Icon name="arrow" size={15} />
                </a>
              ) : (
                <strong>{step.label}</strong>
              )}
              <p>{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
