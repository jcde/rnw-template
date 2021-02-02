import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import Slider from "@react-native-community/slider";

function CupertinoSlider(props) {
  return (
    <Slider
      disabled={props.disabled}
      /*value={this._getSeekSliderPosition()}
            onValueChange={this._onSeekSliderValueChange}
            onSlidingComplete={this._onSeekSliderSlidingComplete}*/
      minimumValue={0}
      maximumValue={100}
      minimumTrackTintColor="#007AFF"
      style={props.style}
      thumbTintColor={'white'}
      maximumTrackTintColor={'white'}
      minimumTrackTintColor={'green'}
      trackHeight ={20}
    ></Slider>
  );
}

const styles = StyleSheet.create({
  slider: {}
});

export default CupertinoSlider;
