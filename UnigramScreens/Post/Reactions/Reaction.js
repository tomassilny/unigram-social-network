import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Actions } from 'react-native-router-flux';

class Reaction extends React.Component {
    constructor(props) {
        super(props);
    }

    goToProfile = () => {
        this.props.handleCloseModal();
        Actions.profile({ userID: this.props.reaction.user_id });
    }

    render() {
        return (
            <View style={{ paddingLeft: 15, paddingRight: 15, marginTop: 18 }}>
                <TouchableOpacity onPress={this.goToProfile} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {this.props.reaction.profile_picture == null ?
                        <Image style={styles.avatar} source={require('./../../../images/avatar.png')} width={40} height={40} />
                        :
                        <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/profile/images/" + this.props.reaction.profile_picture }} width={40} height={40} />
                    }
                    {this.props.reaction.reaction == 'like' &&
                        <Icon name="thumbs-up" color={'#A41034'} size={15} style={{ padding: 3, marginLeft: -15, marginTop: 20 }} />
                    }
                    {this.props.reaction.reaction == 'love' &&
                        <Icon name="heart" color={'red'} size={15} style={{ padding: 3, marginLeft: -15, marginTop: 20 }} />
                    }
                    {this.props.reaction.reaction == 'haha' &&
                        <Image source={require('./../../../images/laugh.png')} width={15} height={15} style={{ padding: 3, marginLeft: -15, marginTop: 20, width: 15, height: 15 }} />
                    }
                    {this.props.reaction.reaction == 'fire' &&
                        <Image source={require('./../../../images/fire.png')} width={15} height={15} style={{ padding: 3, marginLeft: -15, marginTop: 20, width: 15, height: 15 }} />
                    }
                    <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>{this.props.reaction.firstname} {this.props.reaction.surname}</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, marginTop: 10, height: 1, backgroundColor: '#f1f1f1' }}></View>
            </View>
        )
    }
}
Reaction.propTypes = {
    reaction: PropTypes.object.isRequired, postID: PropTypes.string.isRequired
};

export default Reaction

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