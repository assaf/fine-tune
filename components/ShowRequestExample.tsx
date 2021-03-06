import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, Tooltip } from "@nextui-org/react";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import InfoCard from "./InfoCard";

export default function ShowRequestExample({
  reference,
  request,
}: {
  reference: string;
  request: {
    url: string;
    method: string;
    headers: { [key: string]: string };
    body: { [key: string]: string | string[] | number | boolean | undefined };
  };
}) {
  const [, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);
  const code = JSON.stringify(request, null, 2);

  return (
    <InfoCard>
      <details className="bg-white">
        <summary className="font-bold">Request JSON</summary>
        <div className="relative prose">
          <Tooltip
            className="absolute top-0 right-0 p-2"
            content={copied ? "Copied!" : "Click to copy"}
            placement="left"
            onVisibleChange={(visible) => visible && setCopied(false)}
            onClick={async () => {
              await copy(code);
              setCopied(true);
            }}
          >
            <FontAwesomeIcon icon={faCopy} className="text-white" />
          </Tooltip>
          <pre>{code}</pre>
        </div>
        <p>
          <Link href={reference} target="_blank" icon>
            OpenAI Reference
          </Link>
        </p>
      </details>
    </InfoCard>
  );
}
