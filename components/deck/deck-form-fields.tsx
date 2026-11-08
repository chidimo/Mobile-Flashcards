import { getFieldError } from "@/utils/get-error-message";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { View } from "react-native";
import { TextField } from "../ui/text-field";
import { TCreateDeck } from "@/types/generic";
import { useFlash } from "@/context/app-context";
import { cn } from "@/utils/cn";

type Props = {
  isNew?: boolean;
  control: Control<TCreateDeck>;
  errors: FieldErrors<TCreateDeck>;
  className?: string;
};

export const DeckFormFields = (props: Props) => {
  const { isNew = false, control, errors, className } = props;
  const { deckNames } = useFlash();
  return (
    <View className={cn("gap-4", className)}>
      <Controller
        name="title"
        rules={{
          validate: (val) => {
            if (isNew && deckNames.includes(val))
              return "Deck name already exists";
            return true;
          },
          required: { value: true, message: "Name is required" },
        }}
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Deck name"
            placeholder="e.g. Spanish verbs"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={getFieldError(errors.title)}
          />
        )}
      />

      <Controller
        name="passMark"
        rules={{
          validate: function (val) {
            if (Number(val) > 100) return "Should be between 1 and 100";
            if (Number(val) < 1) return "Should be between 1 and 100";
            return true;
          },
          required: { value: true, message: "Pass mark is required" },
        }}
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Pass mark (%)"
            placeholder="50"
            value={String(value)}
            keyboardType="numeric"
            selectTextOnFocus
            onBlur={onBlur}
            onChangeText={onChange}
            error={getFieldError(errors.passMark)}
          />
        )}
      />
    </View>
  );
};
