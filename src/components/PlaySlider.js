import React, { Component } from "react";
import { View, Text, Platform } from "react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import ChipWithButton from "../components/MaterialChipWithCloseButton";
import Slider from "@react-native-community/slider";

export const _getMMSSFromMillis = (millis: number) => {
  const totalSeconds = millis / 1000;
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor(totalSeconds / 60);
  const padWithZero = (number) => {
    const string = number.toString();
    if (number < 10) {
      return "0" + string;
    }
    return string;
  };
  return padWithZero(minutes) + ":" + padWithZero(seconds);
}

function PlaySlider(props) {
  const { playStatus, recordingDuration } = props
  const _getSeekSliderPosition = () => {
    if (
      //sound != null &&
      playStatus.durationMillis != null &&
      playStatus.positionMillis != null
    ) {
      return playStatus.positionMillis / playStatus.durationMillis;
    }
    return 0;
  }
  const _getPlaybackTimestamp = () => {
    let duration = (isNaN(playStatus.durationMillis)
      || !isFinite(playStatus.durationMillis))
      ? recordingDuration : playStatus.durationMillis
    if (
      //sound != null &&
      playStatus.positionMillis != null
      && !isNaN(duration)
      && duration > 0
    ) {
      return `${_getMMSSFromMillis(
        playStatus.positionMillis
      )} / ${_getMMSSFromMillis(duration)}`;
    }
    return "";
  }

  return (<>
    <ChipWithButton iconName="close" iconStyle={{ display: 'none' }} title={props.title} >
      <Slider style={{
        position: 'absolute', left: 0, zIndex: -1,
        width: '100%',
      }}
        trackHeight={40} thumbSize={0}
        minimumTrackTintColor={'#bbdece'}
        maximumTrackTintColor={'transparent'}
        value={_getSeekSliderPosition()}
        //onSlidingComplete={_onSeekSliderSlidingComplete}
        disabled={props.disabled}
      />
    </ChipWithButton>
    <Text style={styles.trackText}>{_getPlaybackTimestamp()}</Text>
  </>)
}

const styles = StyleSheet.create({
  trackText: {
    minWidth: 100,
    margin: 5,
    alignSelf: 'center',
  },
});

export default PlaySlider;
