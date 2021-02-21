import React, { useState } from 'react';
import WhiteBox from './../UnigramComponents.js'
import { ImageBackground, Platform, StyleSheet, Text, View, Image, TextInput, Button, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import ConnectyCube from "react-native-connectycube";
import AsyncStorage from '@react-native-community/async-storage'
import AuthService from '../src/services/auth-service'
import RNRestart from 'react-native-restart';

const CREDENTIALS = {
  appId: 2603,
  authKey: "fqk7-UcAujDnEMb",
  authSecret: "OeL8V8ubSvRLwSX"
};

ConnectyCube.init(CREDENTIALS);
ConnectyCube.createSession()
  .then((session) => { })
  .catch((error) => { });

const goToRegister = () => {
  Actions.register()
}


class Login extends React.Component {
  state = {
    email: '',
    pass: '',
    data: ''
  }

  login = () => {
    const { email } = this.state;
    const { pass } = this.state;

    var login = true;

    if (email == '' || pass == '') {
      Alert.alert("Upozornenie", "Musíte vyplniť všetky polia");
      login = false;
    }

    // If form check is ok, login
    if (login) {
      fetch('https://wawier.com/unigram/login.php?email=' + email + '&pass=' + pass, {
        method: 'GET'
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          this.setState({
            data: responseJson
          })

          const { data } = this.state;

          if (data.id > 0) {
            const dataUser = { full_name: data.fullname, login: data.email, password: pass }
            AuthService.signIn(dataUser)
            AsyncStorage.setItem("@id", JSON.stringify(data.id));
            RNRestart.Restart()
          } else {
            Alert.alert("Chyba", "Nesprávne prihlasovacie údaje");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={{ uri: 'https://bombuj.tv/android_api/unigram/images/unigrambg.png' }} style={styles.image}>
          <Text style={styles.registerText}>Login</Text>
          <WhiteBox>
            <TextInput
              style={{ height: 40, padding: 5, backgroundColor: '#f1f1f1', borderRadius: 10, marginTop: 15 }}
              placeholder={'E-Mail'}
              onChangeText={email => this.setState({ email })}
              returnKeyType="next"
              placeholderTextColor={"grey"}
              textContentType={'emailAddress'}
            />
            <TextInput
              style={{ height: 40, padding: 5, backgroundColor: '#f1f1f1', borderRadius: 10, marginTop: 15, marginBottom: 15 }}
              placeholder={'Password'}
              placeholderTextColor={"grey"}
              returnKeyType="done"
              onChangeText={pass => this.setState({ pass })}
              secureTextEntry={true}
            />

            <Button title={"Log in"} color={"#A41034"} onPress={this.login}></Button>
            <View style={{ margin: 5 }} />
            <Button title={"Create account"} color={"#A41034"} onPress={goToRegister}></Button>

          </WhiteBox>
        </ImageBackground>
      </View>
    )
  }
}
export default Login

const styles = StyleSheet.create({
  image: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    color: 'white',
  },
  whiteBox: {
    marginTop: 30,
    width: '80%',
    height: 200,
  },
  registerText: {
    fontWeight: 'bold',
    fontSize: 35,
    textAlign: 'center',
    color: '#fff',
  },
});
