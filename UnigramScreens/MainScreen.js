import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Image,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from './Header.js';
import ChatScreen from './ChatScreen.js'
import './../Globals.js';
import Posts from './Post/Posts';
import AddPost from './Post/AddPost';
import SettingsScreen from './SettingsScreen';
import NotifyScreen from './NotifyScreen.js';
import AsyncStorage from '@react-native-community/async-storage'

const Tab = createBottomTabNavigator();

const goToLogin = () => {
  Actions.login()
}

function logout() {
  AsyncStorage.removeItem("@id");
  Actions.login();
}

state = {
  id: 0,
  data: '',
  showNavigation: true,
  modalVisible: false,
  unreadNotifications: 0,
  unreadMessages: 0
};

class Main extends React.Component {
  state = {
    unreadNotifications: 0,
    userID: 0,
    loading: true
  }

  async checkLogin() {
    try {
      const id = await AsyncStorage.getItem("@id");
      if (id !== null) {
        this.setState({
          userID: id
        });
        this.countUnreadNotificitations();
        this.countUnreadMessages();
      } else {
        goToLogin();
      }
    } catch (e) {
      goToLogin();
    }
  }


  countUnreadNotificitations() {
    fetch('https://wawier.com/unigram/notifications/count_unread.php?user_id=' + this.state.userID, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState(() => ({
          unreadNotifications: responseJson.count,
        }));

      })
      .catch((error) => {

        console.error(error);
      });
  }

  countUnreadMessages() {
    fetch('https://wawier.com/unigram/chat/countunreadmessages.php?user_id=' + this.state.userID, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState(() => ({
          unreadMessages: responseJson.count,
          loading: false
        }));

      })
      .catch((error) => {
        console.error(error);
      });
  }

  componentDidMount() {
    this.checkLogin();
    this.timer = setInterval(() => {
      this.countUnreadNotificitations();
      this.countUnreadMessages();
    }, 5000)
  }


  HomeFrag() {
    return (
      <View style={styles.scene}>
        <Header></Header>
        <StatusBar backgroundColor="#A41034" barStyle="light-content" />
        <Posts postsFromUserID={0} dashboard={true}></Posts>
      </View>);
  }

  ChatFrag() {
    return (<View style={{
      flex: 1
    }}>
      <Header></Header>
      <ChatScreen></ChatScreen>

    </View>);
  }


  NotifyFrag = () => {
    this.setState({ unreadNotifications: 0 })
    return (
      <View style={{
        flex: 1
      }}>
        <Header></Header>
        <NotifyScreen></NotifyScreen>
      </View>);
  }


  PostFrag() {
    return (
      <View style={styles.scene}>
        <Header></Header>
        <AddPost></AddPost>
      </View>
    );
  }

  SettingsFrag() {
    return (
      <View style={styles.scene}>
        <Header></Header>
        <SettingsScreen></SettingsScreen>
      </View>
    );
  }

  render() {
    return (
      <NavigationContainer>
        {this.state.loading &&
          <View style={{ position: "absolute", flex: 1, backgroundColor: "#A41034", width: "100%", height: "100%", zIndex: 1000, justifyContent: "center" }}>
            <Image source={require('./../images/icon.png')} style={{ alignSelf: "center", width: 150, height: 150 }}></Image>
          </View>
        }
        <Tab.Navigator backBehavior={'none'} initialRouteName="HomeFrag" tabBarOptions={{
          activeTintColor: '#A41034',
        }}>
          <Tab.Screen name="HomeFrag" component={this.HomeFrag} options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="home" color={color} size={size} />)
          }} />
          {this.state.unreadMessages == 0 ?
            <Tab.Screen name="ChatFrag" component={this.ChatFrag} options={{
              tabBarLabel: 'Chat',
              tabBarVisible: true,
              tabBarIcon: ({ color, size }) => (<Icon name="send" color={color} size={20} />)
            }} />
            :
            <Tab.Screen name="ChatFrag" component={this.ChatFrag} options={{
              tabBarLabel: 'Chat',
              tabBarVisible: true,
              tabBarBadge: this.state.unreadMessages,
              tabBarIcon: ({ color, size }) => (<Icon name="send" color={color} size={20} />)
            }} />
          }

          <Tab.Screen name="AddPost" component={this.PostFrag} options={{
            tabBarLabel: 'Add',
            tabBarIcon: ({ color, size }) => (<Icon name="plus" color={color} size={25} />)
          }} />

          {this.state.unreadNotifications == 0 ?
            <Tab.Screen name="NotifyFrag" component={this.NotifyFrag} options={{
              tabBarLabel: 'Alerts',
              tabBarIcon: ({ color, size }) => (<Icon name="bell" color={color} size={20} />)
            }} />
            :
            <Tab.Screen name="NotifyFrag" component={this.NotifyFrag} options={{
              tabBarLabel: 'Alerts',
              tabBarBadge: this.state.unreadNotifications,
              tabBarIcon: ({ color, size }) => (<Icon name="bell" color={color} size={20} />)
            }} />
          }
          <Tab.Screen name="SettingsFrag" component={this.SettingsFrag} options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, size }) => (<Icon name="cog" color={color} size={25} />)
          }} />
        </Tab.Navigator>
      </NavigationContainer>)
  }
}
export default Main

const styles = StyleSheet.create({
  scene: {
    flex: 1
  },
  actionBar: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 3,
    height: 50,
    backgroundColor: '#A41034',
    elevation: 3,
    width: "100%",
    marginBottom: 20,
    justifyContent: 'space-between'
  },
  nameTxt: {
    marginTop: 12,
    left: 0,
    color: '#fff',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  logo: {},
  messageIcon: {
    marginTop: 7
  },
  card: {
    alignSelf: 'center',
    shadowColor: "#000",
    borderRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "white",
    padding: 20,
    marginBottom: 20,
    width: "95%",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
});
