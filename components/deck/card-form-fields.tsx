import { getFieldError } from "@/utils/get-error-message";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { View } from "react-native";
import { TextField } from "../ui/text-field";
import { TCreateCard } from "@/types/generic";

type Props = {
  control: Control<TCreateCard>;
  errors: FieldErrors<TCreateCard>;
};

export const CardFormFields = (props: Props) => {
  const { control, errors } = props;

  return (
    <View className="gap-4">
      <Controller
        name="question"
        rules={{
          required: { value: true, message: "Question is required" },
        }}
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Question"
            placeholder="What do you want to remember?"
            multiline
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={getFieldError(errors.question)}
          />
        )}
      />

      <Controller
        name="answer"
        rules={{
          required: { value: true, message: "Answer is required" },
        }}
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Answer"
            placeholder="The answer"
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={getFieldError(errors.answer)}
          />
        )}
      />

      <Controller
        name="hint"
        rules={{
          required: false,
        }}
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Hint (optional)"
            placeholder="A nudge, shown during the quiz"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={getFieldError(errors.hint)}
          />
        )}
      />
    </View>
  );
};
