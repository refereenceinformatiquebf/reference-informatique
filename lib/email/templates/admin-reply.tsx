import { Text } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";

/** Réponse rédigée par l'équipe depuis l'administration (devis, messages). */
export function AdminReplyEmail({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (
    <EmailLayout preview={heading} heading={heading}>
      {paragraphs.map((paragraph, index) => (
        <Text key={index} style={{ ...emailTextStyle, whiteSpace: "pre-wrap" }}>
          {paragraph}
        </Text>
      ))}
    </EmailLayout>
  );
}
