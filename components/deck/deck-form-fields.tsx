import { getFieldError } from "@/utils/get-error-message";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { StyleProp, View, ViewStyle } from "react-native";
import { Input } from "../form-elements/input";
import { TCreateDeck } from "@/types/generic";
import { useFlash } from "@/context/app-context";

type Props = {
  isNew?: boolean;
  control: Control<TCreateDeck>;
  errors: FieldErrors<TCreateDeck>;
  moreContainerStyle?: StyleProp<ViewStyle>;
};

export const DeckFormFields = (props: Props) => {
  const { isNew = false, control, errors, moreContainerStyle = {} } = props;
  const { deckNames } = useFlash();
  return (
    <View style={[{ width: "100%", marginBottom: 40 }, moreContainerStyle]}>
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
          <Input
            placeholder="Enter deck name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={getFieldError(errors.title)}
            containerStyle={{ marginBottom: 25 }}
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
          <Input
            placeholder="Set pass mark (percentage)"
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
