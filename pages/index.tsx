import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/demo.module.css'

import { useSelector, useDispatch, Provider, connect } from 'react-redux';
import { fetchAllVizData, store, AppDispatch, RootState, SelectTypes, UISelect } from '../app/store';
import { Filters } from '../app/components/filters';
import React from 'react';
import { Results } from '../app/components/results';
import { Box, createMuiTheme, CssBaseline, ThemeProvider, Typography } from '@material-ui/core';
import { invertedTheme } from '../app/components/theme';
import { ThreeCanvas } from '../app/components/three_canvas';
import dynamic from 'next/dynamic';
import { Observation } from '../app/observation';
import { ValueFilters } from '../app/components/value_filters';
import { Title } from '../app/components/title';
import { MAIN_CONTAINER_ID } from '../app/components/ui_utils';
import { SelectOverlays } from '../app/components/select';

const GridViz = dynamic(() => import('../app/components/viz/grid_viz').then((module) => module.GridViz as any), {
  ssr: false,
}) as any;

interface MVPProps {
  fetchAllVizData: (params) => {},
  loadingState: string;
  selectOverlay?: UISelect;
}

interface MVPState {
  assetsLoaded: boolean;
}

export class MVP extends React.Component<MVPProps, MVPState> {
  gridVizRef: React.RefObject<typeof GridViz> = React.createRef<typeof GridViz>();

  constructor(props: MVPProps) {
    super(props);
    this.state = {
      assetsLoaded: false,
    }
  }

  componentDidMount() {
    this.props.fetchAllVizData({ smallDataset: false });
    // load three assets
    import('../app/components/viz/assets').then(module => {
      return module.LoadResources();
    }).then(() => {
      this.setState({ assetsLoaded: true });
    });
  }

  loadingComplete() {
    return this.state.assetsLoaded && this.props.loadingState;
  }

  renderDebugFooter() {
    return (
      <footer className={styles.footer}>
        <Typography gutterBottom>
          Loading {this.props.loadingState}
        </Typography>
      </footer>
    );
  }

  renderSelectOverlay() {
    if (this.props.selectOverlay.current) {
      const Overlay = SelectOverlays[this.props.selectOverlay.current] as any;
      return (
        <div className={styles.selectOverlayContainer}>
          <Overlay {...this.props.selectOverlay.params} />
        </div>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <ThemeProvider theme={invertedTheme}>
        <div id={MAIN_CONTAINER_ID} className={styles.container}>
          {this.loadingComplete() ? (
            <Box display='flex' flexWrap='wrap' justifyContent='center'>
              <Title />
              <GridViz width={800} height={600} /> 
            </Box>
          ) : "Loading"}
          {this.renderSelectOverlay()}
        </div>
      </ThemeProvider>
    )
  }
}

function mapStateToProps(state: RootState, ownProps: MVPProps) {
  return {
    loadingState: state.rawData.loadingState,
    selectOverlay: state.rawData.uiSelect,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchAllVizData: params => dispatch(fetchAllVizData(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MVP as any);
