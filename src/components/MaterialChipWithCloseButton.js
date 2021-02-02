import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function MaterialChipWithCloseButton(props) {
  return (
    <View style={[styles.container, props.style]}>
      <Text style={styles.chipText}>{props.title ?? 'Example Chip'}</Text>
      <Icon
        name={props.iconName || "close-circle"}
        style={[styles.iconStyle, props.iconStyle]}
      ></Icon>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(224, 224, 224, 0.86)",
    paddingLeft: 12,
    borderRadius: 50
  },
  chipText: {
    fontSize: 13,
    color: "rgba(0,0,0,0.87)"
  },
  iconStyle: {
    width: 24,
    color: "white",
    fontSize: 24,
    marginLeft: 4,
    marginRight: 4
  }
});

export default MaterialChipWithCloseButton;
