import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import PropTypes from 'prop-types';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage'
import Posts from '../Post/Posts';
import Modal from 'react-native-modal';
import Follows from './Follows/Follows';
import { Actions } from 'react-native-router-flux';

class Profile extends React.Component {
    state = {
        userID: null,
        loggedUserID: null,
        userDatas: null,
        following: 0,
        followers: 0,
        follow: false,
        followMe: false,
        followersList: null,
        followingList: null,
        showFollowingModal: false,
        showFollowersModal: false
    };

    constructor(props) {
        super(props);
    }

    async getActualUserID() {
        try {
            const id = await AsyncStorage.getItem("@id");
            // if this is profile of logged user (himself)
            if (this.props.userID == null || this.props.userID == id) {
                this.setState({ userID: id });
            }
            if (id !== null) {
                this.setState({ loggedUserID: id }, () => this.getUserDatas());
            }
            this.checkFollow();
            this.getFollowingCount();

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

    checkFollow() {
        fetch('https://wawier.com/unigram/profile/checkuserfollow.php?follower=' + this.state.loggedUserID + "&following=" + this.props.userID, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.id == 1) {
                    this.setState(() => ({
                        follow: true,
                    }));
                } else {
                    this.setState(() => ({
                        follow: false,
                    }));
                }
                this.getFollowingCount()
            })
            .catch((error) => {
                console.error(error);
            });
    }

    follow = () => {
        fetch('https://wawier.com/unigram/profile/follow.php?follower=' + this.state.loggedUserID + "&following=" + this.props.userID, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.id == 1) {
                    this.setState(() => ({
                        follow: true,
                    }, () => this.checkFollow()));
                }
                this.checkFollow()
            })
            .catch((error) => {
                console.error(error);
            });
    }

    loadFollowingUsers() {
        fetch('https://wawier.com/unigram/profile/getfollowing.php?user_id=' + this.state.userID, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    followingList: responseJson,
                }));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    loadFollowersUsers() {
        fetch('https://wawier.com/unigram/profile/getfollowers.php?user_id=' + this.state.userID, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    followersList: responseJson,
                }));
                console.log(this.state.followersList);

            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleCloseModal() {
        this.setState({ showFollowingModal: false, showFollowersModal: false })
    }

    handleApplyChanges() {
        this.getUserDatas();
    }

    goToEditProfile = () => {
        Actions.edit_profile({ userDatas: this.state.userDatas, handleApplyChanges: this.handleApplyChanges.bind(this) });
    }

    sendMessage = () => {
        Actions.chat();
    }

    goToChat = () => {
        Actions.chatwindow({ fromUser: this.state.loggedUserID, toUser: this.state.userID, title: this.state.userDatas.firstname + " " + this.state.userDatas.surname, onRight: () => this.goToProfile(this.state.userID) });
    }

    goToProfile = (userID) => {
        Actions.profile({ userID: userID });
    }

    render() {
        return (
            <View>
                <StatusBar backgroundColor="#A41034" barStyle="light-content" />

                <Modal style={{ justifyContent: "center" }}
                    isVisible={this.state.showFollowersModal}
                    onSwipeComplete={() => this.setState({ showFollowersModal: false })}
                    onModalShow={() => { this.loadFollowersUsers() }}
                    swipeDirection="down"
                    animationIn="slideInUp"
                >

                    <View style={{ width: "100%", height: "90%", backgroundColor: "#fff", borderRadius: 15, elevation: 5 }}>
                        <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 16, alignSelf: 'flex-start' }}>Followers ({this.state.followers})</Text>
                            <TouchableOpacity onPress={() => this.setState({ showFollowersModal: false })}>
                                <Icon name='angle-down' size={24} style={{ alignSelf: 'flex-end' }} color={'grey'}></Icon>
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%', height: 2, backgroundColor: '#eee' }}></View>

                        {this.state.showFollowersModal && this.state.followersList != null ?
                            <Follows
                                users={this.state.followersList}
                                handleCloseModal={this.handleCloseModal.bind(this)}
                            />
                            :
                            <View>
                                <ActivityIndicator size="small" color="#A41034" style={{ marginTop: 15 }} />
                            </View>
                        }
                    </View>
                </Modal>

                <Modal style={{ justifyContent: "center" }}
                    isVisible={this.state.showFollowingModal}
                    onSwipeComplete={() => this.setState({ showFollowingModal: false })}
                    onModalShow={() => { this.loadFollowingUsers() }}
                    swipeDirection="down"
                    animationIn="slideInUp"
                >

                    <View style={{ width: "100%", height: "90%", backgroundColor: "#fff", borderRadius: 15, elevation: 5 }}>
                        <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 16, alignSelf: 'flex-start' }}>Following ({this.state.following})</Text>
                            <TouchableOpacity onPress={() => this.setState({ showFollowingModal: false })}>
                                <Icon name='angle-down' size={24} style={{ alignSelf: 'flex-end' }} color={'grey'}></Icon>
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%', height: 2, backgroundColor: '#eee' }}></View>

                        {this.state.showFollowingModal && this.state.followingList != null ?
                            <Follows
                                users={this.state.followingList}
                                handleCloseModal={this.handleCloseModal.bind(this)}
                            />
                            :
                            <View>
                                <ActivityIndicator size="small" color="#A41034" style={{ marginTop: 15 }} />
                            </View>
                        }
                    </View>
                </Modal>

                {this.state.userDatas != null ?
                    <View>
                        <ScrollView>
                            <View>
                                <View style={{ alignItems: 'center', padding: 20 }}>
                                    {this.state.userDatas.profile_picture == null ?
                                        <Image style={styles.avatar} source={require('./../../images/avatar.png')} width={80} height={80} />
                                        :
                                        <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/profile/images/" + this.state.userDatas.profile_picture }} width={80} height={80} />
                                    }
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>{this.state.userDatas.firstname} {this.state.userDatas.surname}</Text>
                                    {this.state.userDatas.bio.length > 0 &&
                                        <Text style={{ fontSize: 16, marginTop: 5, marginBottom: 5 }}>{this.state.userDatas.bio}</Text>
                                    }
                                    <Text style={{ color: 'grey', marginTop: 5 }}><Icon name={'university'} size={15}></Icon>
                &nbsp;{this.state.userDatas.university}</Text>
                                    <Text style={{ color: 'grey', marginTop: 5 }}><Icon name={'graduation-cap'} size={15}></Icon>&nbsp;
                {this.state.userDatas.faculty}</Text>

                                    <View style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => this.setState({ showFollowersModal: true })} style={{ flexDirection: 'column', alignItems: 'center', marginRight: 15 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{this.state.followers}</Text>
                                            <Text>followers</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.setState({ showFollowingModal: true })} style={{ flexDirection: 'column', alignItems: 'center', marginRight: 15 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{this.state.following}</Text>
                                            <Text>following</Text>
                                        </TouchableOpacity>
                        
                                        {this.state.loggedUserID == this.state.userDatas.user_id ?
                                            <TouchableOpacity onPress={this.goToEditProfile} style={{ padding: 7.2, borderRadius: 5, color: '#000', borderWidth: 1 }} title="Ahoj">
                                                <Text style={{ fontSize: 16 }}><Icon name={'pencil'} size={15}></Icon>&nbsp;Edit profile</Text>
                                            </TouchableOpacity>
                                            :
                                            <View style={{ flexDirection: "row" }}>
                                                {this.state.follow ?
                                                    <TouchableOpacity onPress={this.follow} style={{ padding: 7.2, borderRadius: 5, backgroundColor: "#A41034", borderWidth: 1, borderColor: "#A41034" }} title="Ahoj">
                                                        <Text style={{ fontSize: 16, color: "white" }}><Icon name={'check'} size={15}></Icon>&nbsp;Sledujem</Text>
                                                    </TouchableOpacity>
                                                    :
                                                    <TouchableOpacity onPress={this.follow} style={{ padding: 7.2, borderRadius: 5, color: '#000', borderWidth: 1 }}>
                                                        {this.state.followMe ?
                                                            <Text style={{ fontSize: 16 }}><Icon name={'plus'} size={15}></Icon>&nbsp;Follow back</Text>
                                                            :
                                                            <Text style={{ fontSize: 16 }}><Icon name={'plus'} size={15}></Icon>&nbsp;Follow</Text>
                                                        }
                                                    </TouchableOpacity>
                                                }
                                                <TouchableOpacity onPress={this.goToChat} style={{ padding: 10, borderRadius: 5, color: '#000', borderWidth: 1, marginLeft: 5 }}>
                                                    <Text style={{ fontSize: 16 }}><Icon name={'send'} size={15}></Icon></Text>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    </View>
                                </View>
                                <View style={{ width: '100%', height: 1, backgroundColor: '#f1f1f1' }}></View>
                                <View style={{ flexDirection: 'row', width: "100%" }}>
                                    <View style={{ alignItems: 'center', padding: 10, width: "50%", borderBottomWidth: 2, borderBottomColor: "#A41034" }}>
                                        <TouchableOpacity>
                                            <Text><Icon name='globe' size={20}></Icon>&nbsp;Posts</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ alignItems: 'center', padding: 10, width: "50%" }}>
                                        <TouchableOpacity>
                                            <Text><Icon name='at' size={20}></Icon>&nbsp;Tagged</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ backgroundColor: '#f1f1f1', height: "100%", width: "100%", flex: 1 }}>
                                    <Posts postsFromUserID={this.state.userID}>

                                    </Posts>
                                </View>
                            </View>
                        </ScrollView>
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
Profile.propTypes = { userID: PropTypes.any };

export default Profile

const styles = StyleSheet.create({
    avatar: {
        width: 30,
        height: 30,
        backgroundColor: '#ddd',
        borderRadius: 50,
        borderColor: '#000',
        borderWidth: 1,
    },
});