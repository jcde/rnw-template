import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import Slider from "@react-native-community/slider";

function CupertinoSlider(props) {
  return (
    <View style={[styles.container, props.style]}>
      <Slider 
        disabled={props.disabled}
        /*value={this._getSeekSliderPosition()}
              onValueChange={this._onSeekSliderValueChange}
              onSlidingComplete={this._onSeekSliderSlidingComplete}*/ 
        minimumValue={0}
        maximumValue={100}
        minimumTrackTintColor="#007AFF"
        style={styles.slider}
      ></Slider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  slider: {}
});

export default CupertinoSlider;
