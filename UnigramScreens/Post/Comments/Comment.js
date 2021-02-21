import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage'
import { Actions } from 'react-native-router-flux';

class Comment extends React.Component {
    state = {
        comments: null,
        reaction: null,
        reactionsCount: 0,
        userID: null
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.getActualUserID();
        this.getReactionsCount();
    }


    goToProfile = () => {
        this.props.handleCloseModal();
        Actions.profile({ userID: this.props.comment.author_id });
    }

    async getActualUserID() {
        try {
            const id = await AsyncStorage.getItem("@id");
            if (id !== null) {
                this.setState({ userID: id })
                this.setReactionFromDB();
            }
        } catch (e) {
        }
    }

    setReactionFromDB() {
        // Get if user already react on this comment
        fetch('https://wawier.com/unigram/posts/getreactioncomment.php?user_id=' + this.state.userID + "&post_id=" + this.props.postID + "&comment_id=" + this.props.comment.comment_id, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    reaction: responseJson.reaction,
                }));

            })
            .catch((error) => {
                console.error(error);
            });
    }

    pushedReaction(reaction) {
        fetch('https://wawier.com/unigram/posts/reactcomment.php?user_id=' + this.state.userID + "&post_id=" + this.props.postID + "&comment_id=" + this.props.comment.comment_id + "&reaction=" + reaction, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    reaction: reaction,
                }));
                this.setReactionFromDB();
                this.getReactionsCount();
                console.log(responseJson);

            })
            .catch((error) => {
                console.error(error);
            });
    }

    getReactionsCount() {
        fetch('https://wawier.com/unigram/posts/countcomment.php?comment_id=' + this.props.comment.comment_id, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    reactionsCount: responseJson.count_reactions,
                }));
            })
            .catch((error) => {
                console.error(error);
            });
    }


    render() {
        return (
            <View style={{ paddingLeft: 15, paddingRight: 15, marginTop: 18, width: '88%' }}>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={this.goToProfile}>
                        {this.props.comment.profile_picture == null ?
                            <Image style={styles.avatar} source={require('./../../../images/avatar.png')} width={40} height={40} />
                            :
                            <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/profile/images/" + this.props.comment.profile_picture }} width={40} height={40} />
                        }
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'column', borderRadius: 15, backgroundColor: '#f1f1f1', padding: 10, marginLeft: 5 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={this.goToProfile}>
                                <Text style={{ fontWeight: 'bold' }}>{this.props.comment.firstname} {this.props.comment.surname}</Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 13, color: 'grey', marginLeft: 10 }}>{this.props.comment.datetext}</Text>
                        </View>
                        <Text>{this.props.comment.text}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginLeft: 45 }}>
                    <View style={{ marginTop: 2, flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => this.pushedReaction('like')}>
                            {this.state.reaction == 'like' ?
                                <Icon name="thumbs-up" color={'#A41034'} size={20} />
                                :
                                <Icon name="thumbs-up" color={'#A41034'} size={20} style={{ opacity: 0.3 }} />
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.pushedReaction('love')}>
                            {this.state.reaction == 'love' ?
                                <Icon name="heart" color={'red'} size={20} style={{ marginLeft: 5 }} />
                                :
                                <Icon name="heart" color={'red'} size={20} style={{ marginLeft: 5, opacity: 0.3 }} />
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.pushedReaction('haha')}>
                            {this.state.reaction == 'haha' ?
                                <Image source={require('./../../../images/laugh.png')} width={20} height={20} style={{ marginLeft: 5, width: 20, height: 20 }} />
                                :
                                <Image source={require('./../../../images/laugh.png')} width={20} height={20} style={{ marginLeft: 5, width: 20, height: 20, opacity: 0.3 }} />
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.pushedReaction('fire')}>
                            {this.state.reaction == 'fire' ?
                                <Image source={require('./../../../images/fire.png')} width={20} height={20} style={{ marginLeft: 5, width: 20, height: 20 }} />
                                :
                                <Image source={require('./../../../images/fire.png')} width={20} height={20} style={{ marginLeft: 5, width: 20, height: 20, opacity: 0.3 }} />
                            }
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 13, color: 'grey', marginLeft: 10 }}>{this.state.reactionsCount} reactions</Text>
                    <Text style={{ fontSize: 13, color: 'grey', marginLeft: 10 }}>Reply</Text>
                </View>
            </View>
        )
    }
}
Comment.propTypes = {
    comment: PropTypes.object.isRequired, postID: PropTypes.string.isRequired
};

export default Comment

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
