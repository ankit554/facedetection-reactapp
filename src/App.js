import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

//You must add your own API key here from Clarifai.
const app = new Clarifai.App({
 apiKey: 'a583a174b6c14364a00708a4ad4c968b'
});

const particlesOptions = {
  particles: {
    number: {
      value: 40,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box:{},
  route: 'signin',
  isSignedIn: false,
  user: {
    id:'',
    name:'',
    email:'',
    entries:0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({ user: {
      id:data.id,
      name:data.name,
      email:data.email,
      entries:data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const identifyface = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: identifyface.left_col * width,
      topRow: identifyface.top_row * height,
      rightCol: width - (identifyface.right_col * width),
      bottomRow: height - (identifyface.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    this.setState({box:box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
      app.models.predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input
      )
      .then(response => {
        if(response){
          fetch('https://warm-eyrie-61478.herokuapp.com/rank',{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
              id:this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)
        }
        console.log(response.outputs[0].data.regions);
        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch(err => console.log(err));
  }


  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState);
    }else if(route === 'home'){
      this.setState({isSignedIn:true});
    }
    this.setState({route : route});
  }
  
  render() {
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home' 
            ? <div >
                <Logo />
                <Rank name={this.state.user.name} entries={this.state.user.entries} />
                <ImageLinkForm 
                  onInputChange={this.onInputChange}
                  onButtonSubmit={this.onButtonSubmit}
                />
                <FaceRecognition box={this.state.box}  imageUrl={this.state.imageUrl}/>
                </div>
            : (
               this.state.route === 'signin'
               ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
               : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              )

        }
      </div>
    );
  }
}

export default App;