import React from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { TouchableOpacity, TouchableHighlight, ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage'
import { Actions } from 'react-native-router-flux';

class NotifyScreen extends React.Component {
    state = {
        userID: null,
        notifications: [],
        offset: 0
    };

    constructor(props) {
        super(props);
    }

    async getActualUserID() {
        try {
            const id = await AsyncStorage.getItem("@id");
            // if this is profile of logged user (himself)
            this.setState({ userID: id }, () => this.loadNotifications());

        } catch (e) {
        }
    }

    goToOnePost = (postID) => {
        Actions.post({ postID: postID });
    }

    goToProfile = (userID) => {
        Actions.profile({ userID: userID });
    }

    componentDidMount() {
        // get actual user id and load notifications
        this.getActualUserID();
    }

    loadNotifications() {
        fetch('https://wawier.com/unigram/notifications/get.php?user_id=' + this.state.userID + '&offset=' + this.state.offset, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    notifications: this.state.notifications.concat(responseJson),
                }));
            })
            .catch((error) => {
                console.error(error);
            });

    }

    loadMore = () => {
        this.setState({ offset: this.state.offset + 20 }, () => this.loadNotifications());
    }

    render() {
        return (
            <ScrollView>
                <View>
                    <StatusBar backgroundColor="#A41034" barStyle="light-content" />
                    <View style={styles.block}>
                        <Text style={styles.header}>Upozornenia</Text>
                        {this.state.notifications != null ?
                            <View>
                                {this.state.notifications.length <= 0 &&
                                    <Text style={{ alignSelf: 'center', marginTop: 40, marginBottom: 40, color: 'grey' }}>Zatiaľ žiadne upozornenia</Text>
                                }
                                <FlatList
                                    data={this.state.notifications}
                                    showsVerticalScrollIndicator={false}
                                    onEndReached={this.loadMore}
                                    onEndReachedThreshold={5}
                                    keyExtractor={(item, index) => {
                                        return item.id;
                                    }}
                                    renderItem={({ item }) =>
                                        <View>
                                            {item.action == "reaction" &&
                                                <TouchableOpacity onPress={() => this.goToOnePost(item.id)}>
                                                    <View style={styles.item}>
                                                        {item.note == "like" &&
                                                            <Icon name={"thumbs-up"} color={"#A41034"} size={20} style={{ opacity: 0.3 }}></Icon>
                                                        }
                                                        {item.note == "love" &&
                                                            <Icon name={"heart"} color={"red"} style={{ opacity: 0.3 }} size={20}></Icon>
                                                        }
                                                        {item.note == "haha" &&
                                                            <Image source={require('./../images/laugh.png')} width={20} height={20} style={{ width: 20, height: 20, opacity: 0.3 }} />
                                                        }
                                                        {item.note == "fire" &&
                                                            <Image source={require('./../images/fire.png')} width={20} height={20} style={{ width: 20, height: 20, opacity: 0.3 }} />
                                                        }
                                                        <Text style={styles.itemText}><Text style={{ color: "grey" }}>{item.datetext}&nbsp;</Text>{item.text}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            }
                                            {item.action == "follow" &&
                                                <TouchableOpacity onPress={() => this.goToProfile(item.id)}>
                                                <View style={styles.item}>
                                                        <Icon name={"plus"} color={"#A41034"} size={20} style={{ opacity: 0.3 }}></Icon>
                                                        <Text style={styles.itemText}><Text style={{ color: "grey" }}>{item.datetext}&nbsp;</Text>{item.text}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            }
                                            {item.action == "comment" &&
                                                <TouchableOpacity onPress={() => this.goToOnePost(item.id)}>
                                                <View style={styles.item}>
                                                        <Icon name={"comment"} color={"grey"} size={20} style={{ opacity: 0.3 }}></Icon>
                                                        <Text style={styles.itemText}><Text style={{ color: "grey" }}>{item.datetext}&nbsp;</Text>{item.text}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            }
                                            {item.action == "comments_reaction" &&
                                                <TouchableOpacity onPress={() => this.goToOnePost(item.id)}>
                                                <View style={styles.item}>
                                                        {item.note == "like" &&
                                                            <Icon name={"thumbs-up"} color={"#A41034"} size={20} style={{ opacity: 0.3 }}></Icon>
                                                        }
                                                        {item.note == "love" &&
                                                            <Icon name={"heart"} color={"red"} style={{ opacity: 0.3 }} size={20}></Icon>
                                                        }
                                                        {item.note == "haha" &&
                                                            <Image source={require('./../images/laugh.png')} width={20} height={20} style={{ width: 20, height: 20, opacity: 0.3 }} />
                                                        }
                                                        {item.note == "fire" &&
                                                            <Image source={require('./../images/fire.png')} width={20} height={20} style={{ width: 20, height: 20, opacity: 0.3 }} />
                                                        }
                                                        <Text style={styles.itemText}><Text style={{ color: "grey" }}>{item.datetext}&nbsp;</Text>{item.text}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    }
                                />
                            </View>
                            :
                            <View>
                                <ActivityIndicator size="large" color="#A41034" style={{ marginTop: 15 }} />
                            </View>
                        }
                    </View>
                </View>
            </ScrollView>
        )
    }
}

export default NotifyScreen

const styles = StyleSheet.create({
    avatar: {
        width: 30,
        height: 30,
        backgroundColor: '#ddd',
        borderRadius: 50,
        borderColor: '#000',
        borderWidth: 1,
    },
    block: {
        marginTop: 15,
        width: "95%",
        padding: 20,
        borderRadius: 10,
        backgroundColor: "white",
        elevation: 3,
        alignSelf: "center"
    },
    header: {
        fontWeight: "bold",
        fontSize: 20,
        marginBottom: 10
    },
    item: {
        alignItems: "center",
        flexDirection: "row",
        padding: 10,
        borderBottomColor: "#f1f1f1",
        borderBottomWidth: 1
    },
    itemText: {
        marginLeft: 10,
        fontSize: 16
    }
});