import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";

function MaterialToast1(props) {
  return (
    <View style={[styles.container, props.style]}>
      <Text numberOfLines={1} style={styles.text1}>
        Toast Message
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 288,
    justifyContent: "center",
    backgroundColor: "#323232",
    paddingLeft: 24,
    paddingRight: 24,
    borderRadius: 2
  },
  text1: {
    fontSize: 14,
    color: "rgba(255,255,255,1)"
  }
});

export default MaterialToast1;
