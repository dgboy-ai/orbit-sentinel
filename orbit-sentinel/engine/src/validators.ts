export class MRValidator {
  static validateMRId(mrIid: number): { isValid: boolean; error?: string } {
    if (!Number.isInteger(mrIid)) {
      return { isValid: false, error: 'MR ID must be an integer' };
    }
    if (mrIid <= 0) {
      return { isValid: false, error: 'MR ID must be positive' };
    }
    if (mrIid > 1000000) {
      return { isValid: false, error: 'MR ID exceeds maximum allowed value' };
    }
    return { isValid: true };
  }

  static validateProjectPath(path: string): { isValid: boolean; error?: string } {
    if (!path || typeof path !== 'string') {
      return { isValid: false, error: 'Project path is required' };
    }
    const pathRegex = /^[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+$/;
    if (!pathRegex.test(path)) {
      return { isValid: false, error: 'Project path must be in format "group/project"' };
    }
    if (path.length > 255) {
      return { isValid: false, error: 'Project path is too long' };
    }
    return { isValid: true };
  }

  static validateChangedFiles(files: string[]): { isValid: boolean; error?: string } {
    if (!Array.isArray(files)) {
      return { isValid: false, error: 'Changed files must be an array' };
    }
    if (files.length === 0) {
      return { isValid: false, error: 'At least one changed file must be specified' };
    }
    if (files.length > 100) {
      return { isValid: false, error: 'Too many changed files (maximum 100)' };
    }
    const invalidFiles = files.filter(file => !file || typeof file !== 'string' || file.length > 500);
    if (invalidFiles.length > 0) {
      return { isValid: false, error: 'Invalid file paths found' };
    }
    return { isValid: true };
  }

  static validateChangeDescription(description: string): { isValid: boolean; error?: string } {
    if (!description || typeof description !== 'string') {
      return { isValid: false, error: 'Change description is required' };
    }
    if (description.length < 10) {
      return { isValid: false, error: 'Change description must be at least 10 characters' };
    }
    if (description.length > 10000) {
      return { isValid: false, error: 'Change description is too long (maximum 10,000 characters)' };
    }
    return { isValid: true };
  }

  static validateBranch(branch?: string): { isValid: boolean; error?: string } {
    if (!branch) {
      return { isValid: true };
    }
    if (typeof branch !== 'string') {
      return { isValid: false, error: 'Branch must be a string' };
    }
    if (branch.length > 255) {
      return { isValid: false, error: 'Branch name is too long' };
    }
    if (/[/\\@:~?]/.test(branch)) {
      return { isValid: false, error: 'Branch name contains invalid characters' };
    }
    return { isValid: true };
  }

  static validateAnalyzeChangeParams(params: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const projectPathValidation = this.validateProjectPath(params.projectPath);
    if (!projectPathValidation.isValid) {
      errors.push(`projectPath: ${projectPathValidation.error}`);
    }

    const mrIdValidation = this.validateMRId(params.mrIid);
    if (!mrIdValidation.isValid) {
      errors.push(`mrIid: ${mrIdValidation.error}`);
    }

    const changedFilesValidation = this.validateChangedFiles(params.changedFiles);
    if (!changedFilesValidation.isValid) {
      errors.push(`changedFiles: ${changedFilesValidation.error}`);
    }

    const changeDescriptionValidation = this.validateChangeDescription(params.changeDescription);
    if (!changeDescriptionValidation.isValid) {
      errors.push(`changeDescription: ${changeDescriptionValidation.error}`);
    }

    const branchValidation = this.validateBranch(params.branch);
    if (!branchValidation.isValid) {
      errors.push(`branch: ${branchValidation.error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
