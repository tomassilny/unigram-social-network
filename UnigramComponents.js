import * as React from 'react';
import { View, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

const WhiteBox = ({ children }) => (
    <View style={styles.whiteBackground}>
        {children}
    </View>
)


WhiteBox.propTypes = {
    children: PropTypes.node.isRequired,
}

export default WhiteBox

const styles = StyleSheet.create ({
  whiteBackground: {
    alignSelf: 'center',
    shadowColor: "#000",
    borderRadius: 15,
  shadowOffset: {
  	width: 0,
  	height: 2,
  },
  width: "80%",
  padding: 20,
  marginTop: 30,
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
    backgroundColor: "white",
  },
});
