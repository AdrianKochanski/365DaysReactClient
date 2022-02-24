import React from 'react';

function Footer(props) {
    return(
    <footer className="text-center text-lg-start bg-dark text-muted" {...props}>
        <section
          className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom"
        >
          <div className="me-5 d-none d-lg-block">
            <span>Check my social networks:</span>
          </div>

          <div>
            <a href="" className="me-4 text-reset">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="fab fa-google"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </section>

        <section className="">
          <div className="container text-center text-md-start mt-5">
            <div className="row mt-3">
              <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">
                  <i className="fas fa-gem me-3"></i>Author
                </h6>
                <p>
                    This website was created to explore the possibilities of a rapidly evolving technology that is the world of crypto defi and NFT!
                </p>
              </div>

              <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">
                  Useful links
                </h6>
                <p>
                  <a href="#!" className="text-reset">Github</a>
                </p>
              </div>

              <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                <h6 className="text-uppercase fw-bold mb-4">
                  Contact
                </h6>
                <p><i className="fas fa-home me-3"></i> Męcina, 34-654 Męcina, PL</p>
                <p>
                  <i className="fas fa-envelope me-3"></i>
                  adrian.k960607@gmail.com
                </p>
                <p><i className="fas fa-phone me-3"></i> + 48 734 604 238</p>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
          © 2022 Copyright:
          <a className="text-reset fw-bold" href="#">Adrian Kochański</a>
        </div>
    </footer>
    );
}

export default Footer;