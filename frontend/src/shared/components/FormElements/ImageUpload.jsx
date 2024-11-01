import React, { useRef, useState, useEffect } from 'react';
import './ImageUpload.css';
import Button from './Button';

const ImageUpload = (props) => {
    const [file, setFile] = useState();
    const [previewUrl, setPreviewUrl] = useState();
    const [isValid, setIsValid] = useState(false);

    const callbackName = `src/shared/components/FormElements/ImageUpload.jsx`;

    const filePickerRef = useRef(); // storing filePicker as a Reference

    /* Listen on file changes => re-render */
    useEffect(() => {
        if (!file) {
            return;
        }

        // Using FileReader clunky API...
        const fileReader = new FileReader();
        
        // Execute () => {} whenever FileReader loads a file
        fileReader.onload = () => {
            // setState for previewUrl
            setPreviewUrl(fileReader.result);
        };

        fileReader.readAsDataURL(file);
    }, [file]);

    const pickedHandler = (event) => {
        let pickedFile;
        let fileIsValid = isValid;

        console.log(`\n${callbackName}\npickedHandler:\nevent.target.file`);
        console.log(event.target.files);

        // Only handle 1 file at a time
        if (event.target.files && event.target.files.length === 1) {
            const pickedFile = event.target.files[0];
            setFile(pickedFile);
            setIsValid(true);
            fileIsValid = true;
            // return;
        } else {
            // If event.target.files does not exist => setIsValid(false)
            setIsValid(false);
            fileIsValid = false;
        }

        props.onInput(props.id, pickedFile, fileIsValid);
    };

    const pickImageHandler = () => {
        filePickerRef.current.click();
    };

    return(
        <React.Fragment>
            <div className="form-control">
                {/* still exists in DOM tree */}
                <input 
                    /** Must declare ref props! **/
                    ref={filePickerRef}
                    id={props.id} 
                    style={{display: 'none',}} 
                    type="file" 
                    accept=".jpg,.png,.jpeg"
                    onChange={pickedHandler}
                />
                <div className={`image-upload ${props.center && 'center'}`}>
                    {/* Conditional rendering */}
                    {previewUrl && <img src={previewUrl} alt="Preview" /> }
                    {!previewUrl && <p>Please pick an image.</p>}
                </div>
                <Button 
                type="button"
                onClick={pickImageHandler}
                >
                    Pick Image
                </Button>
            </div>
            {!isValid && <p>{props.errorText}</p>}
        </React.Fragment>
    );
};

export default ImageUpload;