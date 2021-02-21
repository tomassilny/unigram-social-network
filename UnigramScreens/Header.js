import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage'
import ConnectyCube from "react-native-connectycube";
import { TouchableOpacity } from 'react-native-gesture-handler';

class Header extends React.Component {
  state = {
    id: 0,
    firstname: '',
    data: '',
    user: '',
    profile_picture: null
  };

  goToLogin = () => {
    Actions.login()
  }

  goToProfile = () => {
    Actions.profile()
  }

  goToSearch = () => {
    Actions.search()
  }

  async componentDidMount() {

    try {
      const id = await AsyncStorage.getItem("@id");
      if (id !== null) {
        fetch('https://wawier.com/unigram/user.php?id=' + id, {
          method: 'GET'
        })
          .then((response) => response.json())
          .then((responseJson) => {
            console.log(responseJson);
            state.data = responseJson;

            const { data } = state;

            if (data.status > 0) {
              this.setState({ firstname: data.firstname, profile_picture: data.profile_picture });
              const userCredentials = { login: state.data.firstname, password: state.data.pass };
              ConnectyCube.login(userCredentials)
                .then((user) => { })
                .catch((error) => { });

              ConnectyCube.createSession()
                .then((session) => { })
                .catch((error) => { });
              const searchParams = { login: "tomasssilny@gmail.com" };

              ConnectyCube.users
                .get(searchParams)
                .then((result) => { state.user = result })
                .catch((error) => { console.log(error); });
            } else {
              Alert.alert("Chyba", "Chyba pri vyberaní dát z databázy. Skontrolujte svoje internetové pripojenie");
            }
          })
          .catch((error) => {
            console.error(error);
          });

      } else {
        this.goToLogin();
      }
    } catch (e) {
      this.goToLogin();
    }

  }

  getHeaderStyle() {
    if (Platform.OS == "ios") {
      return {
        paddingTop: 40,
        flexDirection: 'row',
        paddingLeft: 15,
        height: 90,
        backgroundColor: '#A41034',
        elevation: 3,
        width: "100%",
      }
    } else {
      return {
        flexDirection: 'row',
        paddingLeft: 15,
        height: 50,
        backgroundColor: '#A41034',
        elevation: 3,
        width: "100%",
      }
    }
  }

  render() {
    return (
      <View style={this.getHeaderStyle()}>
        <View style={{ flexDirection: 'row', width: "33.33%" }}>
          <TouchableOpacity onPress={() => this.goToProfile()}>
            {this.state.profile_picture == null ?
              <Image style={styles.avatar} source={require('./../images/avatar.png')} width={30} height={30} />
              :
              <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/profile/images/" + this.state.profile_picture }} width={30} height={30} />
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.goToProfile()}>
            <Text style={styles.nameTxt}>{this.state.firstname}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ width: "33.33%" }}>
          <Image style={styles.logo} source={require('./../images/icon.png')} width={50} height={50} />
        </View>

        <View style={{ flexDirection: 'row', width: "33.33%", justifyContent: 'flex-end' }}>
        <TouchableOpacity onPress={() => this.goToSearch()}>
            <Icon.Button name="search" backgroundColor="#A41034" style={styles.messageIcon} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export default Header

const styles = StyleSheet.create({
  nameTxt: {
    marginTop: 14,
    left: 0,
    marginLeft: 5,
    color: '#fff',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  logo: {
    alignSelf: 'center'
  },
  messageIcon: {
    alignSelf: 'flex-end',
    marginTop: 7
  },
  avatar: {
    marginTop: 8,
    width: 30,
    height: 30,
    backgroundColor: '#ddd',
    borderRadius: 50,
    borderColor: '#fff',
    borderWidth: 3,
  }
});
