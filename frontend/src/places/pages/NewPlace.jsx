import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import ImageUpload from '../../shared/components/FormElements/ImageUpload';

import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './PlaceForm.scss';

const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  // Initial formState{}, inputHandler: false for custom hook useForm
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      address: {
        value: '',
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );

  /* React Router DOM feature useHistory() */
  const history = useHistory();

  const devPlaceUrl = `http://localhost:3011/api/places`;
    const prodPlaceUrl = `https://little-mern-nodejs-mongodb.onrender.com/api/places`;
    const fetchUrl = process.env.NODE_ENV === 'production' ? prodPlaceUrl : devPlaceUrl;

  const placeSubmitHandler = async (event) => {
    event.preventDefault();  

    try {
      const formData = new FormData();
      formData.append('title', formState.inputs.title.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('address', formState.inputs.address.value);
      // formData.append('creator', auth.userId);
      formData.append('image', formState.inputs.image.value);
          
      /* Logging formData key-value pairs */
      for (let [key, value] of formData.entries()) {
        console.log(`\nformData:\n`, key, value);
      }

      console.log(`\nAttaching auth.token from <AuthContext />:\n`, auth.token, `\n`);
      console.log(`\n\n`,`Bearer ${auth.token}`, `\n\n`);

      // No need to send Headers when using FormData
      await sendRequest(fetchUrl, 
        'POST', 
        formData, {
        Authorization: `Bearer ${auth.token}`
      }
      );      
      history.push('/');

    } catch (err) {} // Error handling inside the Hook
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)."
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address."
          onInput={inputHandler}
        />
        <ImageUpload 
          id="image" 
          onInput={inputHandler} 
          errorText="Please provide an image." 
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewPlace;
