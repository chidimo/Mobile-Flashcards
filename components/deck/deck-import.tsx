import { router } from "expo-router";
import Feather from "@react-native-vector-icons/feather";
import { SubmitHandler, useForm } from "react-hook-form";
import { Share, Text, View } from "react-native";
import { useState } from "react";
import * as Crypto from "expo-crypto";
import { useFlash } from "@/context/app-context";
import { Question, TCreateDeck } from "@/types/generic";
import { useAppTheme } from "@/hooks/use-app-theme";
import { deckPrompt } from "@/lib/ai-prompt";
import { parseDeckFile } from "@/lib/deck-file";
import { useClipboard } from "@/hooks/use-clipboard";
import { markdownToPlain } from "@/utils/markdown-plain";
import { DeckFormFields } from "./deck-form-fields";
import { isValidV4UUID } from "@/utils/validate-uuid";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";
import { showNotification } from "../notifier";

export interface DeckImportProps {
  title: string;
  subtitle: string;
  instructions: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  actionTitle: string;
  /** Resolves to the deck's JSON text, or null when the person backed out. */
  loadText: () => Promise<string | null>;
  onCancel: () => void;
  onSuccess?: () => void;
}

const PREVIEW_COUNT = 3;

/** Gets a deck's JSON from somewhere (clipboard, a file), previews it and imports it. */
export const DeckImport = (props: DeckImportProps) => {
  const { importDeck } = useFlash();
  const { primary, text } = useAppTheme();
  const { copyToClipboard } = useClipboard();
  const [error, setError] = useState<string | null>(null);
  const [qId, setQId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateDeck>({
    defaultValues: {
      title: "",
      passMark: 50,
    },
  });

  const copyPrompt = async () => {
    const copied = await copyToClipboard(deckPrompt).catch(() => false);
    if (copied) {
      showNotification("Prompt copied", "Paste it into your AI chat.");
      return;
    }
    // The clipboard didn't take it: the share sheet has its own Copy.
    showNotification("Couldn't copy", "Choose Copy in the share sheet.");
    await Share.share({ message: deckPrompt }).catch(() => undefined);
  };

  const load = async () => {
    try {
      const text = await props.loadText();
      if (text === null) return;
      const deck = parseDeckFile(text);
      setQId(deck.id);
      setValue("title", deck.title);
      setValue("passMark", deck.passMark);
      setQuestions(
        deck.questions.map((q) => ({
          ...q,
          id: isValidV4UUID(q.id) ? q.id : Crypto.randomUUID(),
        })),
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that deck.");
    }
  };

  const onSubmit: SubmitHandler<TCreateDeck> = (data) => {
    // importDeck mints a new id when the shared one isn't a valid UUID, so decide it here to know where to go.
    const deckId = qId && isValidV4UUID(qId) ? qId : Crypto.randomUUID();
    importDeck(deckId, data.title, data.passMark, questions);
    reset();
    props.onSuccess?.();
    showNotification("Success", "Deck imported successfully!");
    router.replace(`/${deckId}`);
  };

  return (
    <Screen scroll>
      <PageTitle title={props.title} subtitle={props.subtitle} />

      <Card className="gap-4">
        <View className="flex-row items-start gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-ink-700">
            <Feather name={props.icon} size={20} color={primary} />
          </View>
          <Text className="flex-1 text-sm text-neutral-600 dark:text-neutral-300">
            {props.instructions}
          </Text>
        </View>
        {error ? (
          <Text className="text-sm text-red-600 dark:text-red-400">
            {error}
          </Text>
        ) : null}
        <Button
          title={
            questions.length ? `${props.actionTitle} again` : props.actionTitle
          }
          variant="secondary"
          onPress={() => void load()}
        />
      </Card>

      {questions.length ? null : (
        <Card className="gap-4">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-ink-700">
              <Feather name="cpu" size={20} color={primary} />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                Make a deck with AI
              </Text>
              <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                Copy this prompt into Claude, ChatGPT or any AI after
                you&apos;ve talked through a topic. It sends back a deck file to
                import here.
              </Text>
            </View>
          </View>
          <Button
            title="Copy AI prompt"
            variant="outline"
            icon={<Feather name="copy" size={18} color={text} />}
            onPress={() => void copyPrompt()}
          />
        </Card>
      )}

      {questions.length ? (
        <>
          <Card>
            <DeckFormFields isNew control={control} errors={errors} />
          </Card>

          <Card className="gap-3">
            <Text className="text-base font-bold text-neutral-900 dark:text-white">
              {`${questions.length} ${questions.length === 1 ? "card" : "cards"} ready to import`}
            </Text>
            {questions.slice(0, PREVIEW_COUNT).map((question) => (
              <Text
                key={question.id}
                numberOfLines={1}
                className="text-sm text-neutral-600 dark:text-neutral-300"
              >
                • {markdownToPlain(question.question)}
              </Text>
            ))}
            {questions.length > PREVIEW_COUNT ? (
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                and {questions.length - PREVIEW_COUNT} more
              </Text>
            ) : null}
          </Card>
        </>
      ) : null}

      <View className="gap-3">
        <Button
          title="Import deck"
          disabled={!questions.length}
          onPress={handleSubmit(onSubmit)}
        />
        <Button
          title="Cancel"
          variant="ghost"
          onPress={() => {
            reset();
            props.onCancel();
          }}
        />
      </View>
    </Screen>
  );
};
