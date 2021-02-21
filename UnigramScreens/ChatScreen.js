import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Actions } from 'react-native-router-flux';

class ChatScreen extends React.Component {
  state = {
    userID: null,
    chats: null,
    refreshing: false,
  };

  componentDidMount() {
    this.getActualUserIDAndLoadChats();
    this.timer = setInterval(() => this.getMyChats(), 1000)
  }

  async getActualUserIDAndLoadChats() {
    try {
      const id = await AsyncStorage.getItem("@id");
      this.setState({ userID: id });
      this.getMyChats();
    } catch (e) {
    }
  }

  getMyChats() {
    fetch('https://wawier.com/unigram/chat/getmychats.php?user_id=' + this.state.userID, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState(() => ({
          chats: responseJson,
          refreshing: false
        }));
      })
      .catch((error) => {
        console.error(error);
      });
  }

  goToChat = (fromUser, toUser, userName) => {
    Actions.chatwindow({ fromUser: fromUser, toUser: toUser, title: userName, onRight: () => this.goToProfile(toUser) });
  }

  goToProfile = (userID) => {
    Actions.profile({ userID: userID });
  }

  goToGroupChat = (fromUser, groupId, groupName) => {
    Actions.chatwindow({ fromUser: fromUser, group: true, groupId: groupId, title: groupName, onRight: () => this.goToCreateGroup(groupId), rightTitle: "Možnosti" });
  }

  goToCreateGroup = (groupId) => {
    Actions.creategroup({ groupId: groupId });
  }

  onRefresh = () => {
    this.setState({ refreshing: true }, () => this.getMyChats());
  }

  separator() {
    return (
      <View style={{ flex: 1, marginTop: 10, height: 1, backgroundColor: '#f1f1f1' }}></View>
    );
  }

  render() {
    return (
      <View style={styles.block}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.header}>Správy</Text>
          <TouchableOpacity onPress={this.goToCreateGroup} style={{ padding: 7.2, borderRadius: 5, color: '#000', borderWidth: 1, alignSelf: "flex-end" }}>
            <Text style={{ fontSize: 14 }}><Icon name={'group'} size={13}></Icon>&nbsp;Create group</Text>
          </TouchableOpacity>
        </View>
        {this.state.chats != null ?
          <View style={{ flex: 1 }}>
            {this.state.chats.length > 0 ?
              <FlatList
                ItemSeparatorComponent={this.separator}
                data={this.state.chats}
                refreshControl={
                  <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                }
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => {
                  return item.id;
                }}
                renderItem={({ item }) =>
                  <View style={{ paddingLeft: 5, paddingRight: 5, marginTop: 18 }}>
                    {item.group != 1 ?
                      <TouchableOpacity onPress={() => this.goToChat(this.state.userID, item.user_id, item.name + " " + item.surname)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between" }}>
                        <View style={{ alignSelf: "flex-start", flexDirection: "row" }}>
                          {(item.profile_picture == 'null' || item.profile_picture == null) ?
                            <Image style={styles.avatar} source={require('./../images/avatar.png')} width={40} height={40} />
                            :
                            <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/profile/images/" + item.profile_picture }} width={40} height={40} />
                          }
                          <View>
                            <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>{item.name} {item.surname}</Text>
                            {item.count_viewed > 0 ?
                              <Text style={{ marginLeft: 10, fontWeight: "bold" }}>{item.last_message} <Text style={{ color: "grey" }}>{item.datetext}</Text></Text>
                              :
                              <Text style={{ marginLeft: 10 }}>
                                {item.last_message} <Text style={{ color: "grey" }}>{item.datetext}</Text></Text>
                            }
                          </View>
                        </View>
                        {item.count_viewed > 0 &&
                          <View style={{ alignItems: "center" }}>
                            <View style={styles.countViews}>
                              <Text style={styles.countViewsTxt}>{item.count_viewed}</Text>
                            </View>
                          </View>
                        }
                      </TouchableOpacity>
                      :
                      <TouchableOpacity onPress={() => this.goToGroupChat(this.state.userID, item.user_id, item.name)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between" }}>
                        <View style={{ alignSelf: "flex-start", flexDirection: "row" }}>
                          {(item.profile_picture == 'null' || item.profile_picture == null) ?
                            <Image style={styles.avatar} source={require('./../images/avatar.png')} width={40} height={40} />
                            :
                            <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/chat/group_images/" + item.profile_picture }} width={40} height={40} />
                          }
                          <View>
                          <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>{item.name} {item.surname}</Text>
                            {item.count_viewed > 0 ?
                              <Text style={{ marginLeft: 10, fontWeight: "bold" }}>{item.last_message} <Text style={{ color: "grey" }}>{item.datetext}</Text></Text>
                              :
                              <Text style={{ marginLeft: 10 }}>{item.last_message} <Text style={{ color: "grey" }}>{item.datetext}</Text></Text>
                            }
                          </View>
                        </View>
                        {item.count_viewed > 0 &&
                          <View style={{ alignItems: "center" }}>
                            <View style={styles.countViews}>
                              <Text style={styles.countViewsTxt}>{item.count_viewed}</Text>
                            </View>
                          </View>
                        }
                      </TouchableOpacity>
                    }
                  </View>}
              /> :
              <Text style={{ alignSelf: 'center', marginTop: 40, marginBottom: 40, color: 'grey', textAlign: "center" }}>
                <Icon name={"send"} size={50} />{'\n\n'}
              Zatiaľ žiadne správy. Správu môžete odoslať kliknutím na tlačidlo správy v profile používateľa</Text>
            }
          </View>
          :
          <View>
            <ActivityIndicator size="large" color="#A41034" style={{ marginTop: 15 }} />
          </View>
        }
      </View>
    )
  }
}
export default ChatScreen


const styles = StyleSheet.create({
  block: {
    marginTop: 15,
    width: "95%",
    padding: 20,
    flex: 1,
    borderRadius: 10,
    backgroundColor: "white",
    elevation: 3,
    alignSelf: "center",
    marginBottom: 10
  },
  countViews: {
    borderRadius: 1,
    padding: 5,
    width: 30,
    borderRadius: 560,
    backgroundColor: "#A41034",
    elevation: 1,
    alignContent: "center",
    alignItems: "center"
  },
  countViewsTxt: {
    color: "#fff",
    textAlign: "center",
    alignSelf: "center",
    fontWeight: "bold"
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    padding: 10,
    borderBottomColor: "#f1f1f1",
    borderBottomWidth: 1
  },
  avatar: {
    width: 30,
    height: 30,
    backgroundColor: '#ddd',
    borderRadius: 50,
    borderColor: '#000',
    borderWidth: 1,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16
  },
  header: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
    alignSelf: "flex-start"
  }
});