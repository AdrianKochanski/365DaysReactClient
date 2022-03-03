import React from 'react';

function Footer(props) {
    return(
    <footer className="text-center text-lg-start bg-dark text-muted" {...props}>
        <section
          className="d-flex justify-content-center justify-content-lg-between border-bottom"
          style={{padding: '1rem'}}
        >
          <div className="me-5 d-none d-lg-block">
            <span>Check my social networks:</span>
          </div>

          <div>
            <a href="https://www.facebook.com/adrian.kochanski.77" className="me-4 text-reset" style={{marginRight: '0.5rem', textDecoration: 'none'}}>
              <i className="icon-facebook-sign"></i>
            </a>
            <a href="https://twitter.com/Adrian12560493" className="me-4 text-reset" style={{marginRight: '0.5rem', textDecoration: 'none'}}>
              <i className="icon-twitter-sign"></i>
            </a>
            <a href="https://www.instagram.com/adrioss_k/" className="me-4 text-reset" style={{marginRight: '0.5rem', textDecoration: 'none'}}>
              <i className="icon-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/in/adrian-kocha%C5%84ski-228a32174/" className="me-4 text-reset" style={{marginRight: '0.5rem', textDecoration: 'none'}}>
              <i className="icon-linkedin-sign"></i>
            </a>
            <a href="https://github.com/AdrianKochanski" className="me-4 text-reset" style={{textDecoration: 'none'}}>
              <i className="icon-github-sign"></i>
            </a>
          </div>
        </section>

        <section className="">
          <div className="container text-center text-md-start">
            <div className="row mt-4">
              <div className="col-md-3 col-lg-4 col-xl-3 mx-auto">
                <h6 className="text-uppercase fw-bold mb-3">
                  <i className="fas fa-gem me-3"></i>Author
                </h6>
                <p>
                    This website was created to explore the possibilities of a rapidly evolving technology that is the world of crypto defi and NFT!
                </p>
              </div>

              <div className="col-md-3 col-lg-2 col-xl-2 mx-auto">
                <h6 className="text-uppercase fw-bold mb-3">
                  Useful links
                </h6>
                <p>
                  <a href="https://github.com/AdrianKochanski" className="text-reset">Github</a>
                </p>
              </div>

              <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0">
                <h6 className="text-uppercase fw-bold mb-3">
                  Contact
                </h6>
                <p><i className="icon-home"></i> Męcina, 34-654 Męcina, PL</p>
                <p><i className="icon-envelope"></i>adrian.k960607@gmail.com</p>
                <p><i className="icon-phone"></i> + 48 734 604 238</p>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center p-3" style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
          © 2022 Copyright: Adrian Kochański
        </div>
    </footer>
    );
}

export default Footer;