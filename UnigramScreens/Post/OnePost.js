import React from 'react';
import { View, Text, Image, StyleSheet, TextInput, Button, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import Post from './Post'

class OnePost extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        userID: null,
        posts: null
    };

    loadPost() {
        fetch('https://wawier.com/unigram/posts/getpostbyid.php?post_id=' + this.props.postID, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    posts: responseJson,
                }));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    async getActualUserID() {
        try {
            const id = await AsyncStorage.getItem("@id");
            if (id !== null) {
                this.setState({ userID: id })
            }
        } catch (e) {
        }
    }

    componentDidMount() {
        this.getActualUserID();
        this.loadPost();
    }

    render() {
        return (
            <View style={{ backgroundColor: "#f1f1f1", flex: 1 }}>
                {this.state.posts != null ?
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={this.state.posts}
                        keyExtractor={(item, index) => {
                            return item.post_id;
                        }}
                        renderItem={({ item }) =>
                            <Post
                                fullname={item.firstname + " " + item.surname}
                                statusText={item.text}
                                medias={item.medias}
                                published={item.datetext}
                                postID={item.post_id}
                                author_id={item.author_id}
                                profile_picture={item.profile_picture}
                                key={item.post_id}></Post>
                        }
                    />
                    :
                    <View>
                        <ActivityIndicator size="large" color="#A41034" style={{ marginTop: 15 }} />
                    </View>
                }
            </View>
        )
    }
}

export default OnePost
