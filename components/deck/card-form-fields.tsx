import { getFieldError } from "@/utils/get-error-message";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { View } from "react-native";
import { Input } from "../form-elements/input";
import { TCreateCard } from "@/types/generic";

type Props = {
  control: Control<TCreateCard>;
  errors: FieldErrors<TCreateCard>;
};

export const CardFormFields = (props: Props) => {
  const { control, errors } = props;

  return (
    <View style={{ width: "100%", marginBottom: 40 }}>
      <Controller
        name="question"
        rules={{
          required: { value: true, message: "Question is required" },
        }}
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Enter question"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={getFieldError(errors.question)}
            containerStyle={{ marginBottom: 30 }}
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
          <Input
            multiline
            placeholder="Enter answer"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={getFieldError(errors.answer)}
            containerStyle={{ marginBottom: 30 }}
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
          <Input
            placeholder="Enter hint (optional)"
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
