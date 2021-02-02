import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  footer: {
    height: 49,
    width: 375,
    marginTop: 652
  },
  recordButtonRow: {
    height: 100,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  recordButton: {
    borderRadius: 50,
    height: 100,
    width: 100,
    shadowColor: "rgba(255,108,134,1)",
    shadowOffset: {
      width: 0,
      height: 5
    },
    elevation: 30,
    shadowOpacity: 1,
    shadowRadius: 20
  },

  trackRow: {
    height: 40,
    marginBottom: 4,
    marginLeft: 10,
    marginRight: 10,
//    width: '100%',
    flexDirection: "row",
    justifyContent: 'flex-end',
  },

  trackSliderRow: {
    height: 40,
    flexDirection: "row",
  }, 
  trackSlider: {
    width: 147,
    height: 30,
    marginTop: 5,
    minimumTrackTintColor:'green',
  },

  startCard: {
    height: 217,
    width: 291,
    marginTop: -455,
    marginLeft: 42
  },

});

export default styles;