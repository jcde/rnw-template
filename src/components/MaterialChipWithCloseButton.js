import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function MaterialChipWithCloseButton(props) {
  return (
    <View style={[styles.container, props.style]}>
      <Text style={styles.chipText}>Example Chip</Text>
      <Icon
        name={props.iconStyle || "close-circle"}
        style={styles.iconStyle}
      ></Icon>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E0E0E0",
    paddingLeft: 12,
    borderRadius: 50
  },
  chipText: {
    fontSize: 13,
    color: "rgba(0,0,0,0.87)"
  },
  iconStyle: {
    color: "#9E9E9E",
    fontSize: 24,
    marginLeft: 4,
    marginRight: 4
  }
});

export default MaterialChipWithCloseButton;
