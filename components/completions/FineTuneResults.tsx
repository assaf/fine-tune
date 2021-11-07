import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
import { faEye } from "@fortawesome/free-solid-svg-icons/faEye";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Loading } from "@nextui-org/react";
import useAuthentication from "components/account/useAuthentication";
import ErrorMessage from "components/ErrorMessage";
import parse from "csv-parse/lib/sync";
import React from "react";
import { toast } from "react-toastify";
import useSWRImmutable from "swr/immutable";
import { OpenAI } from "types/openai";

type ResultFileRecord = {
  elapsed_examples: number;
  elapsed_tokens: number;
  step: string;
  training_loss: number;
  training_sequence_accuracy: number;
  training_token_accuracy: number;
};

export default function FineTuneResultFile({
  fineTune,
}: {
  fineTune: OpenAI.FineTune;
}) {
  const resultFile = fineTune.result_files[0];
  const { headers } = useAuthentication();
  const { results, error } = useFineTuneResults(resultFile?.id);

  async function download(file: OpenAI.File) {
    const response = await fetch(
      `https://api.openai.com/v1/files/${file.id}/content`,
      { headers }
    );
    if (!response.ok) {
      toast.error(`Failed to download ${file.filename}`);
      return;
    }

    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.type = "text/csv";
    link.download = file.filename;
    link.click();
  }

  return (
    <div className="border rounded-xl shadow-sm p-4 space-y-1">
      <h4>
        Results File
        {results && (
          <span className="ml-2 font-thin">{results.length} records</span>
        )}
      </h4>
      {error && <ErrorMessage error={error} />}
      {results && resultFile ? (
        <div className="flex gap-4 justify-between">
          <Button
            flat
            icon={<FontAwesomeIcon icon={faDownload} />}
            size="small"
            onClick={(event) => {
              event.preventDefault();
              download(resultFile);
            }}
          >
            Download
          </Button>
          <Button
            flat
            icon={<FontAwesomeIcon icon={faEye} />}
            size="small"
            onClick={(event) => {
              event.preventDefault();
              window.open(`/fine-tunes/results/${resultFile.id}`);
            }}
          >
            View
          </Button>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}

function useFineTuneResults(fileId?: string): {
  error?: Error;
  results?: ResultFileRecord[];
} {
  const { headers } = useAuthentication();

  const { data: results, error } = useSWRImmutable<ResultFileRecord[]>(
    fileId ? `files/${fileId}/content` : null,
    async (resource) => {
      const response = await fetch(`https://api.openai.com/v1/${resource}`, {
        headers,
      });
      if (!response.ok) throw new Error(response.statusText);
      const raw = await response.text();
      return parse(raw, { cast: true, columns: true, skip_empty_lines: true });
    }
  );
  return { results, error };
}
