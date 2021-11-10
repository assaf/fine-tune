import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@nextui-org/react";
import useAuthentication from "components/account/useAuthentication";
import ErrorMessage from "components/ErrorMessage";
import SelectEngine from "components/forms/SelectEngine";
import router from "next/router";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-toastify";
import useSWR, { mutate } from "swr";
import { OpenAI } from "types/openai";
import Label from "../forms/Label";

export default function NewFineTuneForm() {
  const { headers } = useAuthentication();
  const { data, error } = useSWR<OpenAI.List<OpenAI.File>>("files");

  const form = useForm<{
    model: string;
    training: string;
    validation?: string;
  }>({
    defaultValues: { model: "ada" },
  });

  const files = data?.data
    .filter((file) => file.purpose === "fine-tune")
    .map((file) => ({
      label: `${file.filename} (${new Date(
        file.created_at * 1000
      ).toDateString()})`,
      value: file.id,
    }));

  async function onSubmit() {
    async ({ model, training, validation }) => {
      try {
        if (training === validation) {
          throw new Error(
            "You cannot use the same file for training and validation"
          );
        }

        const response = await fetch("https://api.openai.com/v1/fine-tunes", {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            training_file: training,
            validation_file: validation,
          }),
        });
        if (response.ok) {
          await mutate("fine-tune");
          await router.push("/completions");
          toast.success("Model created!");
        } else {
          const { error } = (await response.json()) as OpenAI.ErrorResponse;
          throw new Error(error.message);
        }
      } catch (error) {
        toast.error(String(error));
      }
    }

  return (
    <main className="max-w-2xl mx-auto space-y-8 mb-8">
      <h1 className="text-3xl">
        Fine Tune <span className="font-normal">Completions Model</span>
      </h1>
      {error && <ErrorMessage error={error} />}
      {data && (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <fieldset className="space-y-4">
              <Label label="OpenAI Engine">
                <SelectEngine name="model" required />
              </Label>
              <Label label="Training File">
                <Select
                  options={files}
                  {...form.register("training", { required: true })}
                  onChange={(selection) =>
                    form.setValue("training", selection?.value ?? "")
                  }
                />
              </Label>
              <Label label="Validation File (optional)">
                <Select
                  isClearable
                  escapeClearsValue
                  options={files}
                  {...form.register("model")}
                  onChange={(newValue) =>
                    form.setValue("validation", newValue?.value)
                  }
                />
              </Label>
            </fieldset>
            <Button
              auto
              iconRight={<FontAwesomeIcon icon={faChevronRight} />}
              loading={form.formState.isSubmitting}
              type="submit"
            >
              Create Model
            </Button>
          </form>
        </FormProvider>
      )}
    </main>
  );
}
