import React, { Component } from "react";
import { View, Text, Platform } from "react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import ButtonShare from "./MaterialButtonShare";
import PlaySlider from './PlaySlider';
import styles from '../screens/RecordingViewStyle';

function PlaySliderSaved(props) {
  const { index, recordings, redraw } = props
  const _onPlayPausePressed1 = async () => {
    let rec = recordings[index]
    rec.sound.setOnPlaybackStatusUpdate((status) => {
      rec.playStatus = status
      redraw([...recordings])
    });
    if (rec.playStatus.isPlaying) {
      rec.sound.pauseAsync();
    } else {
      rec.sound.playAsync();
    }
  };
  const _onDeletePressed1 = async () => {
    let rec = recordings[index]
    rec.sound.setOnPlaybackStatusUpdate(null)
    await rec.sound.unloadAsync()
    recordings.splice(index, 1)
    redraw([...recordings])
  }
  return (<>
    {recordings.length >= index + 1 &&
      <View style={styles.trackRow}>
        <ButtonShare icon={recordings[index].playStatus.isPlaying ? "pause-circle-outline" : "play-outline"}
          onPress={_onPlayPausePressed1} />
        <PlaySlider title={recordings[index].title}
          playStatus={recordings[index].playStatus} />
        <ButtonShare icon="delete-outline" onPress={_onDeletePressed1} />
      </View>}
  </>)
}

export default PlaySliderSaved;
