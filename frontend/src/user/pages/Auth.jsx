import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';
import { isValid } from 'ipaddr.js';

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false
      },
      password: {
        value: '',
        isValid: false
      }
    },
    false
  );

  const switchModeHandler = () => {
    // Login mode
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined // Do not show <ImageUpload /> when signed in
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      // Sign up mode
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: '',
            isValid: false
          },
          // Adding image file to be sent to Backend
          image: {
            value: null,
            isValid: false
          }
        },
        false
      );
    }
    setIsLoginMode(prevMode => !prevMode);
  };

  const authSubmitHandler = (event) => {
    event.preventDefault();

    console.log(`\nformState.inputs:`);
    console.log(formState.inputs); // console logging useForm custom hook inputs

    const devLoginUrl = `http://localhost:3011/api/users/login`;
    const prodLoginUrl = `https://little-mern-backend.onrender.com/api/users/login`;
    const fetchLoginUrl = process.env.NODE_ENV === 'production' ? prodLoginUrl : devLoginUrl;

    const devSignupUrl = `http://localhost:3011/api/users/signup`;
    const prodSignupUrl = `https://little-mern-backend.onrender.com/api/users/signup`;
    const fetchSignupUrl = process.env.NODE_ENV === 'production' ? prodSignupUrl : devSignupUrl;

    // Check isLoginMode true (Login mode) || false (Signup mode)
    if (isLoginMode) { // Login mode

        sendRequest(
          fetchLoginUrl,
          'POST',
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value
          }),
          {
            'Content-Type': 'application/json'
          }
        )
        .then((response) => {
          auth.login(response.user.id);
        })
    } else { // Sign up mode
      // For sending binary data to Backend from Browser
      const formData = new FormData();
      formData.append('name', formState.inputs.name.value);
      formData.append('email', formState.inputs.email.value);
      formData.append('password', formState.inputs.password.value);
      formData.append('image', formState.inputs.image.value);

      sendRequest(
        fetchSignupUrl,
          'POST',
          formData, // instead of JSON.stringify({})
          // No need to set headers
          // {
          //   'Content-Type': 'application/json'
          // }
        )
      .then((response) => {
        auth.login(response.user.id);
      })
    }
  };

  return (
    <React.Fragment>
      {/* Forwarding error from this component to <ErrorModal/> */}
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {/* asOverlay true by default */}
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              validators={[VALIDATOR_REQUIRE(6)]}
              errorText="Please enter a name."
              onInput={inputHandler}
            />
          )}
          {/* ImageUpload => Check 'Logged In' */}
          {/* Binding 'inputHandler' in userForm Custom Hook as a props to <ImageUpload /> */}
          {!isLoginMode && <ImageUpload center id="image" onInput={inputHandler} />}
          <Input
            element="input"
            id="email"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password, at least 6 characters."
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
