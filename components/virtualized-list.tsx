import React from "react";
import { FlatList, RefreshControl, View } from "react-native";

type Props = {
  refreshing?: boolean;
  onRefresh?: (...args: any[]) => any;
};

export const VirtualizedList = (props: React.PropsWithChildren<Props>) => {
  const { children, refreshing = false, onRefresh } = props;

  return (
    <FlatList
      data={[]}
      showsVerticalScrollIndicator={false}
      style={{ width: "100%" }}
      keyExtractor={() => "key"}
      renderItem={null}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={refreshing || false}
        />
      }
      ListHeaderComponent={
        <View
          style={{
            flex: 1,
            marginBottom: 50,
          }}
        >
          {children}
        </View>
      }
    />
  );
};
