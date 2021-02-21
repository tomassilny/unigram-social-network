import React from 'react';
import { View, Text, Keyboard, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import Comment from './Comment';
import KeyboardListener from 'react-native-keyboard-listener';

class Comments extends React.Component {
    state = {
        comments: [],
        text: null,
        marginTop: 0,
        offset: 0
    }

    constructor(props) {
        super(props);
    }

    handleCloseModal() {
        this.props.handleCloseModal();
    }

    loadComments() {
        // Get comments for this post from db
        fetch('https://wawier.com/unigram/posts/getcomments.php?post_id=' + this.props.postID + "&offset=" + this.state.offset, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    comments: this.state.comments.concat(responseJson),
                }));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    componentDidMount() {
        this.loadComments();
    }

    addComment() {
        this.textInput.clear()
        this.setState({ text: null });

        if (this.state.text != null && this.state.text != '') {
            fetch('https://wawier.com/unigram/posts/addcomment.php?post_id=' + this.props.postID + '&user_id=' + this.props.userID + '&text=' + this.state.text, {
                method: 'GET'
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.id > 0) {
                        this.loadComments();
                    } else {
                        Alert.alert("Chyba", "Chyba pri pridávaní komentáru");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    loadMore=()=>{
        this.setState({ offset: this.state.offset + 6 }, () => this.loadComments());
    }

    render() {
        return (
            <View>
                <KeyboardListener
                    onDidShow={() => { this.setState({ marginTop: -45 }); }}
                    onDidHide={() => { this.setState({ marginTop: 0 }); }}
                />
                <View style={{ height: "83%" }}>
                    {this.state.comments != null ?
                        <View>
                            {this.state.comments.length <= 0 &&
                                <Text style={{ alignSelf: 'center', marginTop: 40, color: 'grey' }}>You can be first who add comment</Text>
                            }
                            <FlatList
                                data={this.state.comments}
                                showsVerticalScrollIndicator={false}
                                onEndReached={this.loadMore}
                                onEndReachedThreshold={1.5}
                                keyExtractor={(item, index) => {
                                    return item.comment_id;
                                }}
                                renderItem={({ item }) =>
                                    <Comment
                                        key={item.comment_id}
                                        comment={item}
                                        postID={this.props.postID}
                                        handleCloseModal={this.handleCloseModal.bind(this)}
                                    />
                                }
                            />
                        </View>
                        :
                        <View>
                            <ActivityIndicator size="large" color="#A41034" style={{ marginTop: 15 }} />
                        </View>
                    }
                </View>

                <View style={{ marginTop: this.state.marginTop, backgroundColor: '#fff' }}>
                    <View style={{ width: '100%', height: 2, backgroundColor: '#eee' }}></View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                        <TextInput
                            style={{ height: 40, width: '85%', backgroundColor: '#eee', borderRadius: 15, textAlignVertical: "top", elevation: 1, margin: 10 }}
                            placeholder={"Type comment..."}
                            multiline={true}
                            ref={input => { this.textInput = input }}
                            onChangeText={text => this.setState({ text })}
                        />

                        <TouchableOpacity onPress={() => this.addComment()}>
                            <Icon name={'send'} size={25} style={{ marginTop: 18, marginRight: 10 }} color={'#A41034'}></Icon>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        )
    }
}
Comments.propTypes = {
    userID: PropTypes.string.isRequired, postID: PropTypes.string.isRequired,
};

export default Comments