const errorMessages = {
    network: "Unable to connect! Please check your internet connection.",
    server: "TMDb appears to be down! Please try again later.",
    unknown: "Something went wrong! Please try again later."
};

function Error({ errorType = null }) {
    return (
        <div className="error-screen">
            <h1>Error!</h1>
            <p className="error-message">
                {errorMessages[errorType]}
            </p>
        </div>
    );
}

export default Error;