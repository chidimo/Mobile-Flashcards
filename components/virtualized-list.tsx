import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

type Props = {
  refreshing?: boolean;
  onRefresh?: (...args: any[]) => any;
};

export const VirtualizedList = (props: React.PropsWithChildren<Props>) => {
  const { children, refreshing=false, onRefresh } = props;

  return (
    <FlatList
      data={[]}
      showsVerticalScrollIndicator={false}
      keyExtractor={() => "key"}
      renderItem={null}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={refreshing || false}
        />
      }
      ListHeaderComponent={<View style={styles.header}>{children}</View>}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    marginBottom: 50,
  },
});
