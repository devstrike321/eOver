import React, { useState } from 'react';
import FilerobotImageEditor from 'filerobot-image-editor';

const FilerobotImageEditorComp = (props) => { 
    const src = "https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg";
    const [show, toggle] = useState(false);

    return(
        <div>
            <h1>Filerobot Image Editor</h1>
            <img
                src={src}
                onClick={() => {
                    toggle(true);
                }}
                alt="example"
            />

            <FilerobotImageEditor
                show={show}
                src={src}
                onClose={() => {
                    toggle(false);
                }}
            />
        </div>
    );
};

export default FilerobotImageEditorComp;
    