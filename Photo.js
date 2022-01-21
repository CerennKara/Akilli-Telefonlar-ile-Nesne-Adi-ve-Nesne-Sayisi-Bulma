import React,{Component} from 'react';
import {Button,View,Text,StyleSheet,FlatList,TouchableOpacity,Dimensions,Image,Alert} from 'react-native';
import {ActionSheet,Root} from 'native-base';
import ImagePicker from 'react-native-image-crop-picker'
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
const width = Dimensions.get('window').width;

export default class Photo extends Component{
    constructor(props){
        super(props);
        this.state={
            fileList: []
        }
    }
    submitToGoogle = async (uri,url) => { //Bu fonksiyon githubdan alınmıştır
        let image=uri;
        try {
			let body = JSON.stringify({
				requests: [
					{
						features: [
							{ type: 'OBJECT_LOCALIZATION', maxResults: 10 }
						],
						image: {
							source: {
								imageUri:image
							}
						}
					}
				]
			});
			let response = await fetch(
				'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDCu6IxVIZ8WmZQsij5nukBQYzgXN1LI7I',
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: body,
				}
			);
			let responseJson = await response.json();
            console.log(responseJson);
            let jsonL = responseJson.responses[0].localizedObjectAnnotations;
            firestore()
            .collection("Images")
            .add({
                fileuri:uri,
                image:url,
                json:jsonL,
                objectNumber:jsonL.length
            })
            .catch((e)=>{
                console.log(e);
            });
            let i;
            for (i = 0; i < jsonL.length; i++) {
              var x1=jsonL[i].boundingPoly.normalizedVertices[0].x;
              var y1=jsonL[i].boundingPoly.normalizedVertices[0].y;
              var x2=jsonL[i].boundingPoly.normalizedVertices[1].x;
              var y3=jsonL[i].boundingPoly.normalizedVertices[2].y;
              var width=(x1-x2);
              var height=(y1-y3);
              //Karenin köşelerini hesaplamak için oluşturmuştuk ama çizemedik...
              console.log(jsonL[i].name);
            }
		} catch (error) {
			console.log(error);
        }
		
    };
    savePhoto= async (url) =>{
        let filename= url.toString().substring(url.toString().lastIndexOf('/')+1);
        try{
            await storage().ref(filename).putFile(url);
            Alert.alert(
                'Image uploaded!'
            );
        }catch(e){
            console.log(e);
        }
        const storageRef=storage().ref(filename);
        const task=storageRef.putFile(url);
        const url1=await storageRef.getDownloadURL();
        let uri='gs://yazlab-2b94a.appspot.com/';
        uri+=filename;
        this.submitToGoogle(uri,url1);
    };
    onSelectedImage= (image) =>{
        let newDataImg=this.state.fileList;
        const source = image.path;
        let item={
            id: Date.now(),
            url: source,
            content: image.data,
        }
        newDataImg.push(item);
        this.setState({fileList:newDataImg})
    };
    takePhotoFromCamera=()=>{
        ImagePicker.openCamera({
            compressImageMaxWidth: 500,
            compressImageMaxHeight: 500,
            compressImageQuality: 0.7,
            cropping: true,
          }).then(image => {
            this.onSelectedImage(image);
          });
    };
    chooseFromGalery=()=>{
        ImagePicker.openPicker({
            compressImageMaxWidth: 500,
            compressImageMaxHeight: 500,
            compressImageQuality: 0.7,
            cropping: true
          }).then(image => {
            this.onSelectedImage(image);
          });
    };
    onClickAddImage = () => {
        const BUTTONS = ['Take Photo' , 'Choose Photo Galery', 'Cancel'];
        ActionSheet.show({options:BUTTONS,cancelButtonIndex:2,title: 'Select a Photo'},
        buttonIndex=>{
            switch(buttonIndex){
                case 0:
                    this.takePhotoFromCamera();
                    this.setState({fileList:[]})
                    break;
                case 1:
                    this.chooseFromGalery();
                    this.setState({fileList:[]})
                    break;
                default:
                    break
            }
        } )
    };
    renderItem = ({item,index}) =>{
        let {itemViewImage,itemImage} =styles;
        return(
            <View style={itemViewImage}>
                <Image source={{uri: item.url}} style={itemImage}/>
                <Button title="Save" style={styles.buttonView} onPress={() => this.savePhoto(item.url)}> </Button>
            </View>
        )
    };
    render(){
        let {content, btnPressStyle, txtStyle} = styles;
        let{fileList} = this.state;
        return(
            <Root>
                <View style={content}>
                <Text style={{fontSize:40}}>Photo Screen</Text> 
                <FlatList
                    data={fileList}
                    renderItem={this.renderItem}
                    keyExtractor={(item,index) => index.toString()}
                    extraData={this.state}
                />
                <TouchableOpacity onPress={this.onClickAddImage} style={btnPressStyle}>
                    <Text style={txtStyle}>Press add Image</Text>
                </TouchableOpacity>
            </View>
            </Root>
        );
    }
}
const styles=StyleSheet.create({
    content:{
        flex: 1,
        alignItems: 'center', 
        marginTop: 50,
        paddingLeft: 30,
        paddingRight: 30,
        marginBottom: 30
    },
    btnPressStyle: {
        backgroundColor: '#0080ff',
        height: 50,
        width: width-60,
        alignItems: 'center',
        justifyContent: 'center'
    },
    txtStyle:{
        color: '#ffffff',
    },
    itemImage: {
        backgroundColor: '#2F455C',
        height: 150,
        width: width-60,
        borderRadius: 8,
        resizeMode: 'contain'
    },
    itemViewImage:{
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    buttonView:{
        borderRadius: 60,
        paddingVertical: 14,
        paddingHorizontal: 10,
        backgroundColor: '#f01d71'
    }

});