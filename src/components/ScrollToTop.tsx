import React from 'react';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { IconButton, Fab } from '@material-ui/core';

interface Props {
  scrollStepInPx: number;
  delayInMs: number;
  className: any;
}

class ScrollToTop extends React.Component<Props> {
  state = {
    intervalId: 0,
    thePosition: false,
  };

  componentDidMount() {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 170) {
        this.setState({ thePosition: true });
      } else {
        this.setState({ thePosition: false });
      }
    });
    window.scrollTo(0, 0);
  }

  onScrollStep = () => {
    if (window.pageYOffset === 0) {
      clearInterval(this.state.intervalId);
    }
    window.scroll(0, window.pageYOffset - this.props.scrollStepInPx);
  };

  scrollToTop = () => {
    let intervalId = setInterval(this.onScrollStep, this.props.delayInMs);
    this.setState({ intervalId: intervalId });
  };

  renderGoTopIcon = () => {
    if (this.state.thePosition) {
      return (
        <Fab onClick={this.scrollToTop} color="primary" className={this.props.className}>
          <KeyboardArrowUpIcon />
        </Fab>
      );
    }
  };

  render() {
    return <React.Fragment>{this.renderGoTopIcon()}</React.Fragment>;
  }
}

export default ScrollToTop;
