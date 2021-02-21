import React, { Component, useEffect } from 'react';
import { AppRegistry, View, Text } from 'react-native';
import Routes from './Routes.js'

class Main extends Component {
   render() {
      return (
         <Routes />
      )
   }
}
export default Main
AppRegistry.registerComponent('Main', () => Main)
