var React = require("react");
import PropTypes from "prop-types";
import { uploadFileV2 } from "../../services/upload.service";

export default class UploadInputWidget extends React.Component {
  static propTypes = {
    componentname: PropTypes.string,
    entity: PropTypes.object,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.state = { value: this.props.value || "" };
    this.inputRef = null;
  }

  onChange = e => {
    var value = e.target.value;
    this.setState({ value: value });
    if (this.props.onChange) {
      this.props.onChange(this.props.name, value);
    }
  };

  componentWillReceiveProps(newProps) {
    if (newProps.value !== this.state.value) {
      this.setState({ value: newProps.value });
    }
  }

  handleClickUploadFile = () => {
    this.inputRef.click();
  };

  onFileChange = e => {
    const file = e.target.files[0];
    uploadFileV2(file)
      .then(({ url }) => {
        console.log("url", url);
        this.setState({ value: url });
        if (this.props.onChange) {
          this.props.onChange(this.props.name, url);
        }
      })
      .catch(err => {
        console.error(err);
        // alert(err);
      });
  };

  render() {
    return (
      <div className="row">
        <input
          type="file"
          className="hidden"
          // accept only glb files
          // accept=".glb"
          onChange={this.onFileChange}
          ref={ref => (this.inputRef = ref)}
        />
        <a
          title="Upload file"
          className="button fa fa-upload"
          onClick={this.handleClickUploadFile}
        />
        <input
          type="text"
          className="string"
          value={this.state.value || ""}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
