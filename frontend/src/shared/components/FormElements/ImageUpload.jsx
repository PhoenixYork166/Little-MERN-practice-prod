import React, { useRef, useState, useEffect } from 'react';
import './ImageUpload.scss';
import Button from './Button';

// Parent component
// src/user/pages/Auth.jsx
const ImageUpload = (props) => {
    const [file, setFile] = useState();
    const [previewUrl, setPreviewUrl] = useState();
    const [isValid, setIsValid] = useState(false);

    const callbackName = `src/shared/components/FormElements/ImageUpload.jsx`;

    const filePickerRef = useRef(); // storing filePicker as a Reference

    /* Whenever an Image file is mounted to DOM */
    /* Listen on file changes => re-render */
    useEffect(() => {
        if (!file) {
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        };
        
        fileReader.readAsDataURL(file);
    }, [file]);

    const pickedHandler = (event) => {
        let pickedFile;
        let fileIsValid = isValid;

        console.log(`\n${callbackName}\npickedHandler:\nevent.target.files[0]`);
        console.log(event.target.files[0]);

        // Only handle 1 file at a time
        if (event.target.files && event.target.files.length === 1) {
            pickedFile = event.target.files[0];
            console.log(`\npickedFile: `, pickedFile, `\n`);
            setFile(pickedFile);
            setIsValid(true);
            
            fileIsValid = true;
        } else {
            setIsValid(false);
            
            fileIsValid = false;
        }

        props.onInput(props.id, pickedFile, fileIsValid);
    };

    /* onClick handler */
    const pickImageHandler = () => {
        filePickerRef.current.click(); // Open File Selector in Frontend
    };

    return(
        <React.Fragment>
            <div className="form-control">
                {/* still exists in DOM tree */}
                <input 
                    id={props.id} 
                    /** Must declare ref props! **/
                    ref={filePickerRef}
                    style={{display: 'none', }} 
                    type="file" 
                    accept=".jpg,.png,.jpeg"
                    onChange={pickedHandler}
                />
                <div className={`image-upload ${props.center && 'center'}`}>
                    {/* Conditional rendering */}
                    {previewUrl && <img id="preview-url" src={previewUrl} alt="Preview" /> }
                    {!previewUrl && <p className="paragraph">Please pick an image.</p>}
                </div>
                <Button 
                type="button"
                onClick={pickImageHandler}
                >
                    Pick Image
                </Button>
            </div>
            {!isValid && <p className="errorText">{props.errorText}</p>}
        </React.Fragment>
    );
};

export default ImageUpload;