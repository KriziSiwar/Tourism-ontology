import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, IconButton, Typography, Paper, Grid } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const ImageUploader = ({
  images = [],
  onUpload,
  onDelete,
  onSetMain,
  maxFiles = 5,
  maxSizeMB = 5,
  accept = 'image/*'
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles?.length) {
      setUploading(true);
      try {
        for (const file of acceptedFiles) {
          await onUpload(file);
        }
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        setUploading(false);
      }
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024, // Convert MB to bytes
    maxFiles,
    disabled: uploading || images.length >= maxFiles
  });

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Existing images */}
        {images.map((image) => (
          <Grid item xs={12} sm={6} md={4} key={image.id}>
            <Paper
              elevation={3}
              sx={{
                position: 'relative',
                paddingTop: '75%', // 4:3 aspect ratio
                borderRadius: 1,
                overflow: 'hidden',
                '&:hover .image-actions': {
                  opacity: 1,
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${image.url || URL.createObjectURL(image)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              <Box
                className="image-actions"
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  left: 0,
                  p: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetMain?.(image.id);
                  }}
                  color={image.isMain ? 'warning' : 'default'}
                  sx={{ color: 'white' }}
                >
                  {image.isMain ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(image.id);
                  }}
                  color="error"
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}

        {/* Upload area */}
        {images.length < maxFiles && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              {...getRootProps()}
              elevation={1}
              sx={{
                p: 2,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                textAlign: 'center',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 150,
              }}
            >
              <input {...getInputProps()} />
              <AddPhotoAlternateIcon
                color="action"
                sx={{ fontSize: 48, mb: 1 }}
              />
              <Typography variant="body2" color="textSecondary">
                {isDragActive
                  ? 'Déposez les images ici...'
                  : `Glissez-déposez des images ici, ou cliquez pour sélectionner (max ${maxFiles - images.length} restants)`}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                Formats acceptés: JPG, PNG, WEBP (max {maxSizeMB}Mo par image)
              </Typography>
              {uploading && (
                <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                  Téléchargement en cours...
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ImageUploader;
