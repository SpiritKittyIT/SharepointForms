import * as React from 'react';
import { Log, FormDisplayMode } from '@microsoft/sp-core-library';
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';

import styles from './FormTemplates.module.scss';

export interface IFormTemplatesProps {
  context: FormCustomizerContext;
  displayMode: FormDisplayMode;
  onSave: () => void;
  onClose: () => void;
}

const LOG_SOURCE: string = 'FormTemplates';

export default class FormTemplates extends React.Component<IFormTemplatesProps, {}> {
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: FormTemplates mounted');
  }

  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: FormTemplates unmounted');
  }

  public render(): React.ReactElement<{}> {
    return <div className={styles.formTemplates} />;
  }
}
