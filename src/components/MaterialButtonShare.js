import React, { Component } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function MaterialButtonShare(props) {
  return (
    <TouchableOpacity style={[styles.container, props.style]}
      onPress={props.onPress} disabled={props.disabled}>
      <Icon name={props.icon || "share-variant"}
        style={[props.disabled ? styles.iconDisabled : styles.icon, props.iconStyle]}></Icon>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    shadowColor: "#111",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.2,
    elevation: 2,
    minWidth: 40,
    minHeight: 40
  },
  icon: {
    color: "rgba(255,108,134,1)",
    fontSize: 24,
    alignSelf: "center"
  },
  iconDisabled: {
    color: "rgba(255,108,134,.5)",
    fontSize: 24,
    alignSelf: "center"
  },
});

export default MaterialButtonShare;
