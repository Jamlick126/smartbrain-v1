import React from 'react';

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            name: '',
            errorMessage: '',
            isLoading: false
        };  
    }
    onNameChange = (event) => {
        this.setState({name: event.target.value, errorMessage: ''})
    }

    onEmailChange = (event) => {
        this.setState({email: event.target.value, errorMessage: ''})
    }

    onPasswordChange = (event) => {
        this.setState({password: event.target.value, errorMessage: ''})
    }

    onSubmitSignIn = () => {
      const { email, password, name } = this.state;

    // Client-side validation
      if (!email || !password || !name) {
      return this.setState({ errorMessage: 'Incorrect form submission. Please fill in all fields.' });
      }

      this.setState({ isLoading: true, errorMessage: '' });  
    
      fetch('https://smartbrain-api-tthq.onrender.com/register', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: email,
          password: password,
          name: name
        })
      })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Unable to register. Email may already be in use.');
        })
        .then(user => {
            if (user.id) {
                this.props.loadUser(user);
                this.props.onRouteChange('home');
            }
        })
        .catch(err => {
            this.setState({ errorMessage: err.message, isLoading: false });
        });
            
    }

    render() {
        const { errorMessage, isLoading } = this.state;

         return (
            <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
                <main className="pa4 black-80">
                <div className="measure">
                    <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                    <legend className="f1 fw6 ph0 mh0">Register</legend>

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="bg-washed-red red pa2 mb3 br2 ba b--red f6">
                        {errorMessage}
                        </div>
                    )}

                    <div className="mt3">
                        <label className="db fw6 lh-copy f6" htmlFor="name">Name</label>
                        <input 
                            className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                            type="text" name="name"  id="name"
                            onChange={this.onNameChange}/>
                    </div>
                    <div className="mt3">
                        <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                        <input 
                            className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                            type="email" name="email-address"  id="email-address"
                            onChange={this.onEmailChange}/>
                    </div>
                    <div className="mv3">
                        <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                        <input 
                            className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                            type="password" name="password"  id="password"
                            onChange={this.onPasswordChange}/>
                    </div>
                    </fieldset>
                    <div className="">
                    <input 
                        onClick={this.onSubmitSignIn}
                        className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" 
                        type="submit" 
                        value={isLoading ? 'Registering...' : 'Register'}
                        disabled={isLoading}
                    />
                    </div>
                </div>
            </main>
            </article>    
        );
    }
}

export default Register;
