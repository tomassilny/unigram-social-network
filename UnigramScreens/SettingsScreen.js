import React from 'react';
import { View, Text, StyleSheet, StatusBar, Settings } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { TouchableOpacity, TouchableHighlight, ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage'
import { Actions } from 'react-native-router-flux';


class SettingsScreen extends React.Component {
    state = {
        userID: null,
    };

    constructor(props) {
        super(props);
    }

    async getActualUserID() {
        try {
            const id = await AsyncStorage.getItem("@id");
            // if this is profile of logged user (himself)
            this.setState({ userID: id });

        } catch (e) {
        }
    }

    getUserDatas() {
        fetch('https://wawier.com/unigram/user.php?id=' + this.state.userID, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    userDatas: responseJson
                }));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getFollowingCount() {
        fetch('https://wawier.com/unigram/profile/getfollowscount.php?user_id=' + this.state.userID, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    following: responseJson.following,
                    followers: responseJson.followers
                }));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    componentDidMount() {
        this.getActualUserID();
        if (this.props.userID == null) {

        } else {
            this.setState({ userID: this.props.userID }, () => this.getUserDatas());
        }
    }

    goToEditProfile = () => {
        Actions.edit_profile({ userDatas: this.state.userDatas, handleApplyChanges: this.handleApplyChanges.bind(this) });
    }

    render() {
        return (
            <ScrollView>
                <View>
                    <StatusBar backgroundColor="#A41034" barStyle="light-content" />
                    <View style={styles.block}>
                        <Text style={styles.header}>General</Text>
                        <TouchableOpacity>
                            <View style={styles.item}>
                                <Icon name={"pencil"} size={20}></Icon>
                                <Text style={styles.itemText}>Edit profile</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <View style={styles.item}>
                                <Icon name={"key"} size={20}></Icon>
                                <Text style={styles.itemText}>Change password</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.block}>
                        <Text style={styles.header}>About</Text>
                        <TouchableOpacity>
                            <View style={styles.item}>
                                <Icon name={"life-ring"} size={20}></Icon>
                                <Text style={styles.itemText}>Support</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <View style={styles.item}>
                                <Icon name={"envelope"} size={20}></Icon>
                                <Text style={styles.itemText}>Contact us</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <View style={styles.item}>
                                <Icon name={"bullhorn"} size={20}></Icon>
                                <Text style={styles.itemText}>Advertisement</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <View style={styles.item}>
                                <Icon name={"globe"} size={20}></Icon>
                                <Text style={styles.itemText}>Web site</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.block}>
                        <Text style={styles.header}>Important files</Text>
                        <TouchableOpacity>
                            <View style={styles.item}>
                                <Icon name={"file"} size={20}></Icon>
                                <Text style={styles.itemText}>Terms of use</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <View style={styles.item}>
                                <Icon name={"user-secret"} size={20}></Icon>
                                <Text style={styles.itemText}>Privacy policy</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text style={{ padding: 15, color: "grey" }}>
                        <Icon name={"rocket"}></Icon>
                        &nbsp;v0.0.1 beta
                        {"\n"}
                        Unigram &copy; 2020
                        </Text>

                </View>
            </ScrollView>

        )
    }
}

export default SettingsScreen

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